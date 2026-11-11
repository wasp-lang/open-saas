import { type PrismaClient } from "@prisma/client";
import express from "express";
import type { Stripe } from "stripe";
import { env, type MiddlewareConfigFn } from "wasp/server";
import { type PaymentsWebhook } from "wasp/server/api";
import { UnhandledWebhookEventError } from "../errors";
import { findPaymentPlanIdByPaymentProcessorPlanId } from "../paymentProcessorPlans";
import { getPaymentPlanCreditsAmount } from "../plans";
import { processWebhookEventOnce } from "../processedWebhookEvent";
import { syncUserSubscription } from "../subscription";
import { recordUserPayment } from "../user";
import { stripeApi } from "./stripeApi";
import { fetchStripeSubscriptionState } from "./subscriptionState";

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
  try {
    const event = constructStripeEvent(request);

    await handleStripeEvent(
      event,
      context.entities.User,
      context.entities.ProcessedWebhookEvent,
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
  userDelegate: PrismaClient["user"],
  processedWebhookEventDelegate: PrismaClient["processedWebhookEvent"],
): Promise<void> {
  if (!isHandledStripeEvent(event)) {
    throw new UnhandledWebhookEventError(event.type);
  }

  const customerId = getCustomerId(event.data.object.customer);
  if (!customerId) {
    // E.g. a payment made outside of our checkout.
    return;
  }

  if (event.type === "invoice.paid") {
    // Payments can't be fetched again, so we record each one once.
    await processWebhookEventOnce(
      { paymentProcessorEventId: event.id, eventType: event.type },
      processedWebhookEventDelegate,
      () => handleInvoicePaid(event.data.object, customerId, userDelegate),
    );
  }

  await syncUserSubscription(
    customerId,
    fetchStripeSubscriptionState,
    userDelegate,
  );
}

function isHandledStripeEvent(
  event: Stripe.Event,
): event is HandledStripeEvent {
  return (HANDLED_STRIPE_EVENT_TYPES as readonly string[]).includes(event.type);
}

/**
 * Every event here triggers `syncUserSubscription`.
 * Your Stripe webhook must send all of them.
 * See: https://docs.opensaas.sh/guides/deploying/#stripe
 */
const HANDLED_STRIPE_EVENT_TYPES = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
] as const satisfies Stripe.Event["type"][];

type HandledStripeEvent = Extract<
  Stripe.Event,
  { type: (typeof HANDLED_STRIPE_EVENT_TYPES)[number] }
>;

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  customerId: Stripe.Customer["id"],
  userDelegate: PrismaClient["user"],
): Promise<void> {
  await recordUserPayment(
    {
      paymentProcessorUserId: customerId,
      datePaid: getInvoicePaidAtDate(invoice),
      numOfCreditsPurchased: getNumOfCreditsPurchased(invoice),
    },
    userDelegate,
  );
}

function getNumOfCreditsPurchased(invoice: Stripe.Invoice): number {
  let numOfCreditsPurchased = 0;
  for (const invoiceLineItem of invoice.lines.data) {
    const priceId = invoiceLineItem.pricing?.price_details?.price;
    const paymentPlanId =
      priceId && findPaymentPlanIdByPaymentProcessorPlanId(priceId);
    if (paymentPlanId) {
      numOfCreditsPurchased += getPaymentPlanCreditsAmount(paymentPlanId);
    }
  }

  return numOfCreditsPurchased;
}

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): Stripe.Customer["id"] | null {
  if (!customer) {
    return null;
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
