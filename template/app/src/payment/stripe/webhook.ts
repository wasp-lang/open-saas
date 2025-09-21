import { type PrismaClient } from "@prisma/client";
import express from "express";
import type { Stripe } from "stripe";
import { HttpError, type MiddlewareConfigFn } from "wasp/server";
import { type PaymentsWebhook } from "wasp/server/api";
import { emailSender } from "wasp/server/email";
import { requireNodeEnvVar } from "../../server/utils";
import { assertUnreachable } from "../../shared/utils";
import { UnhandledWebhookEventError } from "../errors";
import { PaymentPlanId, paymentPlans, SubscriptionStatus } from "../plans";
import {
  updateUserStripeOneTimePaymentDetails,
  updateUserStripeSubscriptionDetails,
} from "./paymentDetails";
import { stripeClient } from "./stripeClient";

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
    const stripeEvent = constructStripeEvent(request);

    switch (stripeEvent.type) {
      case "invoice.paid":
        await handleInvoicePaid(stripeEvent, prismaUserDelegate);
        break;
      case "customer.subscription.updated":
        await handleCustomerSubscriptionUpdated(
          stripeEvent,
          prismaUserDelegate,
        );
        break;
      case "customer.subscription.deleted":
        await handleCustomerSubscriptionDeleted(
          stripeEvent,
          prismaUserDelegate,
        );
        break;
      default:
        // If you'd like to handle more events, you can add more cases above.
        // When deploying your app, you configure your webhook in the Stripe dashboard
        // to only send the events that you're handling above.
        // See: https://docs.opensaas.sh/guides/deploying/#setting-up-your-stripe-webhook
        // In development, it is likely that you will receive other events that you are not handling.
        // These can be ignored without any issues.
        if (process.env.NODE_ENV === "production") {
          throw new UnhandledWebhookEventError(stripeEvent.type);
        }
    }
    return response.status(204).send();
  } catch (err) {
    if (err instanceof UnhandledWebhookEventError) {
      response.status(204).send();
      throw err;
    }

    console.error("Stripe webhook error:", err);
    if (err instanceof HttpError) {
      return response.status(err.statusCode).json({ error: err.message });
    } else {
      return response
        .status(400)
        .json({ error: "Error processing Stripe webhook event" });
    }
  }
};

function constructStripeEvent(request: express.Request): Stripe.Event {
  const stripeWebhookSecret = requireNodeEnvVar("STRIPE_WEBHOOK_SECRET");
  const stripeSignature = request.headers["stripe-signature"];
  if (!stripeSignature) {
    throw new HttpError(400, "Stripe webhook signature not provided");
  }

  return stripeClient.webhooks.constructEvent(
    request.body,
    stripeSignature,
    stripeWebhookSecret,
  );
}

async function handleInvoicePaid(
  event: Stripe.InvoicePaidEvent,
  prismaUserDelegate: PrismaClient["user"],
): Promise<void> {
  const invoice = event.data.object;
  const customerId = getCustomerId(invoice.customer);
  const invoicePaidAtDate = getInvoicePaidAtDate(invoice);
  const paymentPlanId = getPaymentPlanIdByPriceId(getInvoicePriceId(invoice));

  switch (paymentPlanId) {
    case PaymentPlanId.Credits10:
      await updateUserStripeOneTimePaymentDetails(
        {
          customerId,
          datePaid: invoicePaidAtDate,
          numOfCreditsPurchased: paymentPlans.credits10.effect.amount,
        },
        prismaUserDelegate,
      );
      break;
    case PaymentPlanId.Pro:
    case PaymentPlanId.Hobby:
      await updateUserStripeSubscriptionDetails(
        {
          customerId,
          datePaid: invoicePaidAtDate,
          paymentPlanId,
          subscriptionStatus: SubscriptionStatus.Active,
        },
        prismaUserDelegate,
      );
      break;
    default:
      assertUnreachable(paymentPlanId);
  }
}

/**
 * We only expect one line item, if your workflow expected more, you should change this function to handle them.
 */
function getInvoicePriceId(invoice: Stripe.Invoice): Stripe.Price["id"] {
  const invoiceLineItems = invoice.lines.data;
  if (invoiceLineItems.length === 0 || invoiceLineItems.length > 1) {
    throw new HttpError(
      400,
      "There should be exactly one line item in Stripe invoice",
    );
  }

  const priceId = invoiceLineItems[0].pricing?.price_details?.price;
  if (!priceId) {
    throw new Error("Unable to extract price id from items");
  }

  return priceId;
}

async function handleCustomerSubscriptionUpdated(
  event: Stripe.CustomerSubscriptionUpdatedEvent,
  prismaUserDelegate: PrismaClient["user"],
): Promise<void> {
  const subscription = event.data.object;

  // There are other subscription statuses, such as `trialing` that we are not handling.
  let subscriptionStatus: SubscriptionStatus | undefined;
  if (subscription.status === SubscriptionStatus.Active) {
    subscriptionStatus = SubscriptionStatus.Active;
    if (subscription.cancel_at_period_end) {
      subscriptionStatus = SubscriptionStatus.CancelAtPeriodEnd;
    }
  } else if (subscription.status === SubscriptionStatus.PastDue) {
    subscriptionStatus = SubscriptionStatus.PastDue;
  } else {
    return;
  }

  const customerId = getCustomerId(subscription.customer);
  const paymentPlanId = getPaymentPlanIdByPriceId(
    getSubscriptionPriceId(subscription),
  );

  const user = await updateUserStripeSubscriptionDetails(
    { customerId, paymentPlanId, subscriptionStatus },
    prismaUserDelegate,
  );

  if (subscription.cancel_at_period_end) {
    if (user.email) {
      await emailSender.send({
        to: user.email,
        subject: "We hate to see you go :(",
        text: "We hate to see you go. Here is a sweet offer...",
        html: "We hate to see you go. Here is a sweet offer...",
      });
    }
  }
}

/**
 * We only expect one subscription item, if your workflow expected more, you should change this function to handle them.
 */
function getSubscriptionPriceId(
  subscription: Stripe.Subscription,
): Stripe.Price["id"] {
  const subscriptionItems = subscription.items.data;
  if (subscriptionItems.length === 0 || subscriptionItems.length > 1) {
    throw new HttpError(
      400,
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

  await updateUserStripeSubscriptionDetails(
    { customerId, subscriptionStatus: SubscriptionStatus.Deleted },
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

function getPaymentPlanIdByPriceId(priceId: string): PaymentPlanId {
  const planId = Object.values(PaymentPlanId).find(
    (paymentPlanId) =>
      paymentPlans[paymentPlanId].getPaymentProcessorPlanId() === priceId,
  );
  if (!planId) {
    throw new Error(`No payment plan with Stripe price id ${priceId}`);
  }

  return planId;
}
