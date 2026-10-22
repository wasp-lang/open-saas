import { type PrismaClient } from "@prisma/client";
import express from "express";
import type { Stripe } from "stripe";
import { env, type MiddlewareConfigFn } from "wasp/server";
import { type PaymentsWebhook } from "wasp/server/api";
import { emailSender } from "wasp/server/email";
import { assertUnreachable } from "../../shared/utils";
import { UnhandledWebhookEventError } from "../errors";
import { getPaymentPlanIdByPaymentProcessorPlanId } from "../paymentProcessorPlans";
import { PaymentPlanId, paymentPlans, SubscriptionStatus } from "../plans";
import { processWebhookEventOnce } from "../processedWebhookEvent";
import { updateUserCredits, updateUserSubscription } from "../user";
import { stripeApi } from "./stripeApi";

/**
 * Stripe requires a raw request to construct events successfully.
 */
export const stripeMiddlewareConfigFn: MiddlewareConfigFn = (
  middlewareConfig,
) => {
  middlewareConfig.delete("express.json");
  middlewareConfig.set(
    "express.raw",
    express.raw({ type: "application/json" }),
  );
  return middlewareConfig;
};

export const stripeWebhook: PaymentsWebhook = async (
  request,
  response,
  context,
) => {
  const prismaUserDelegate = context.entities.User;
  try {
    const event = constructStripeEvent(request);

    await processWebhookEventOnce(
      { paymentProcessorEventId: event.id, eventType: event.type },
      context.entities.ProcessedWebhookEvent,
      () => handleStripeEvent(event, prismaUserDelegate),
    );
    return response.status(204).send();
  } catch (error) {
    if (error instanceof UnhandledWebhookEventError) {
      // In development, it is likely that we will receive events that we are not handling.
      // E.g. via the `stripe trigger` command.
      if (process.env.NODE_ENV === "development") {
        console.info("Unhandled Stripe webhook event in development: ", error);
      } else if (process.env.NODE_ENV === "production") {
        console.error("Unhandled Stripe webhook event in production: ", error);
      }

      // We must return a 2XX status code, otherwise Stripe will keep retrying the event.
      return response.status(204).send();
    }

    console.error("Stripe webhook error:", error);
    if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    } else {
      return response
        .status(500)
        .json({ error: "Error processing Stripe webhook event" });
    }
  }
};

function constructStripeEvent(request: express.Request): Stripe.Event {
  const stripeWebhookSecret = env.STRIPE_WEBHOOK_SECRET;
  const stripeSignature = request.headers["stripe-signature"];
  if (!stripeSignature) {
    throw new Error("Stripe webhook signature not provided");
  }

  return stripeApi.webhooks.constructEvent(
    request.body,
    stripeSignature,
    stripeWebhookSecret,
  );
}

async function handleStripeEvent(
  event: Stripe.Event,
  prismaUserDelegate: PrismaClient["user"],
): Promise<void> {
  // If you'd like to handle more events, you can add more cases below.
  // When deploying your app, you configure your webhook in the Stripe dashboard
  // to only send the events that you're handling above.
  // See: https://docs.opensaas.sh/guides/deploying/#setting-up-your-stripe-webhook
  switch (event.type) {
    case "invoice.paid":
      await handleInvoicePaid(event, prismaUserDelegate);
      break;
    case "customer.subscription.updated":
      await handleCustomerSubscriptionUpdated(event, prismaUserDelegate);
      break;
    case "customer.subscription.deleted":
      await handleCustomerSubscriptionDeleted(event, prismaUserDelegate);
      break;
    default:
      throw new UnhandledWebhookEventError(event.type);
  }
}

async function handleInvoicePaid(
  event: Stripe.InvoicePaidEvent,
  prismaUserDelegate: PrismaClient["user"],
): Promise<void> {
  const invoice = event.data.object;
  const customerId = getCustomerId(invoice.customer);
  const invoicePaidAtDate = getInvoicePaidAtDate(invoice);
  const paymentPlanId = getPaymentPlanIdByPaymentProcessorPlanId(
    getInvoicePriceId(invoice),
  );

  switch (paymentPlanId) {
    case PaymentPlanId.Credits10:
      await updateUserCredits(
        {
          paymentProcessorUserId: customerId,
          datePaid: invoicePaidAtDate,
          numOfCreditsPurchased: paymentPlans[paymentPlanId].effect.amount,
        },
        prismaUserDelegate,
      );
      break;
    case PaymentPlanId.Pro:
    case PaymentPlanId.Hobby: {
      // Guard against late/retried invoice events: re-fetch and use live subscription state
      const subscriptionId = getInvoiceSubscriptionId(invoice);
      if (!subscriptionId) {
        // No subscription on this invoice, fall back to event data
        await updateUserSubscription(
          {
            paymentProcessorUserId: customerId,
            datePaid: invoicePaidAtDate,
            paymentPlanId,
            subscriptionStatus: SubscriptionStatus.Active,
          },
          prismaUserDelegate,
        );
        break;
      }

      const liveSubscription =
        await stripeApi.subscriptions.retrieve(subscriptionId);
      if (isSubscriptionTerminal(liveSubscription.status)) {
        console.info(
          `Ignoring invoice.paid for terminal subscription ${subscriptionId}`,
        );
        return;
      }

      // Use live subscription state to avoid writing stale data
      const liveSubscriptionStatus =
        getOpenSaasSubscriptionStatus(liveSubscription);
      if (!liveSubscriptionStatus) {
        return;
      }

      const livePlanId = getPaymentPlanIdByPaymentProcessorPlanId(
        getSubscriptionPriceId(liveSubscription),
      );

      await updateUserSubscription(
        {
          paymentProcessorUserId: customerId,
          datePaid: invoicePaidAtDate,
          paymentPlanId: livePlanId,
          subscriptionStatus: liveSubscriptionStatus,
        },
        prismaUserDelegate,
      );
      break;
    }
    default:
      assertUnreachable(paymentPlanId);
  }
}

function getInvoicePriceId(invoice: Stripe.Invoice): Stripe.Price["id"] {
  const invoiceLineItems = invoice.lines.data;
  // We only expect one line item.
  // If your workflow expects more, you should change this function to handle them.
  if (invoiceLineItems.length !== 1) {
    throw new Error("There should be exactly one line item in Stripe invoice");
  }

  const priceId = invoiceLineItems[0].pricing?.price_details?.price;
  if (!priceId) {
    throw new Error("Unable to extract price id from items");
  }

  return priceId;
}

function getInvoiceSubscriptionId(
  invoice: Stripe.Invoice,
): Stripe.Subscription["id"] | null {
  const subscription = invoice.parent?.subscription_details?.subscription;
  if (!subscription) {
    return null;
  }
  return typeof subscription === "string" ? subscription : subscription.id;
}

function isSubscriptionTerminal(status: Stripe.Subscription.Status): boolean {
  return status === "canceled" || status === "incomplete_expired";
}

async function handleCustomerSubscriptionUpdated(
  event: Stripe.CustomerSubscriptionUpdatedEvent,
  prismaUserDelegate: PrismaClient["user"],
): Promise<void> {
  const subscription = event.data.object;

  // Guard against out-of-order events: re-fetch the live subscription state from Stripe.
  // If this subscription is already canceled or expired, ignore the event.
  const liveSubscription = await stripeApi.subscriptions.retrieve(
    subscription.id,
  );
  if (isSubscriptionTerminal(liveSubscription.status)) {
    console.info(
      `Ignoring stale update for terminal subscription ${subscription.id}`,
    );
    return;
  }

  // Use the live subscription state (not the event payload) to avoid writing stale data
  const subscriptionStatus = getOpenSaasSubscriptionStatus(liveSubscription);
  if (!subscriptionStatus) {
    return;
  }

  const customerId = getCustomerId(liveSubscription.customer);
  const paymentPlanId = getPaymentPlanIdByPaymentProcessorPlanId(
    getSubscriptionPriceId(liveSubscription),
  );

  const user = await updateUserSubscription(
    { paymentProcessorUserId: customerId, paymentPlanId, subscriptionStatus },
    prismaUserDelegate,
  );

  if (liveSubscription.cancel_at_period_end && user.email) {
    await emailSender.send({
      to: user.email,
      subject: "We hate to see you go :(",
      text: "We hate to see you go. Here is a sweet offer...",
      html: "We hate to see you go. Here is a sweet offer...",
    });
  }
}

function getOpenSaasSubscriptionStatus(
  subscription: Stripe.Subscription,
): SubscriptionStatus | undefined {
  const stripeToOpenSaasSubscriptionStatus: Record<
    Stripe.Subscription.Status,
    SubscriptionStatus | undefined
  > = {
    trialing: SubscriptionStatus.Active,
    active: SubscriptionStatus.Active,
    past_due: SubscriptionStatus.PastDue,
    canceled: SubscriptionStatus.Deleted,
    unpaid: SubscriptionStatus.Deleted,
    incomplete_expired: SubscriptionStatus.Deleted,
    paused: undefined,
    incomplete: undefined,
  };

  const subscriptionStatus =
    stripeToOpenSaasSubscriptionStatus[subscription.status];

  if (
    subscriptionStatus === SubscriptionStatus.Active &&
    subscription.cancel_at_period_end
  ) {
    return SubscriptionStatus.CancelAtPeriodEnd;
  }

  return subscriptionStatus;
}

function getSubscriptionPriceId(
  subscription: Stripe.Subscription,
): Stripe.Price["id"] {
  const subscriptionItems = subscription.items.data;
  // We only expect one subscription item.
  // If your workflow expects more, you should change this function to handle them.
  if (subscriptionItems.length !== 1) {
    throw new Error(
      "There should be exactly one subscription item in Stripe subscription",
    );
  }

  return subscriptionItems[0].price.id;
}

async function handleCustomerSubscriptionDeleted(
  event: Stripe.CustomerSubscriptionDeletedEvent,
  prismaUserDelegate: PrismaClient["user"],
): Promise<void> {
  const subscription = event.data.object;
  const customerId = getCustomerId(subscription.customer);

  // Guard against out-of-order delete events: check if customer has any live subscription.
  // List all subscriptions and skip downgrade if any is not terminal (handles trialing, active, past_due, etc).
  const allSubscriptions = await stripeApi.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });

  const hasLiveSubscription = allSubscriptions.data.some(
    (sub) => !isSubscriptionTerminal(sub.status),
  );

  if (hasLiveSubscription) {
    console.info(
      `Ignoring delete of ${subscription.id}: customer ${customerId} has a live subscription`,
    );
    return;
  }

  await updateUserSubscription(
    {
      paymentProcessorUserId: customerId,
      subscriptionStatus: SubscriptionStatus.Deleted,
    },
    prismaUserDelegate,
  );
}

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): Stripe.Customer["id"] {
  if (!customer) {
    throw new Error("Customer is missing");
  } else if (typeof customer === "string") {
    return customer;
  } else {
    return customer.id;
  }
}

function getInvoicePaidAtDate(invoice: Stripe.Invoice): Date {
  if (!invoice.status_transitions.paid_at) {
    throw new Error("Invoice has not been paid yet");
  }

  // Stripe returns timestamps in seconds (Unix time),
  // so we multiply by 1000 to convert to milliseconds.
  return new Date(invoice.status_transitions.paid_at * 1000);
}
