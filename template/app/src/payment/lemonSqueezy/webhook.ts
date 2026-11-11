import crypto from "crypto";
import express from "express";
import {
  env,
  HttpError,
  type MiddlewareConfigFn,
  type PrismaClient,
} from "wasp/server";
import type { PaymentsWebhook } from "wasp/server/api";
import { UnhandledWebhookEventError } from "../errors";
import { findPaymentPlanIdByPaymentProcessorPlanId } from "../paymentProcessorPlans";
import { getPaymentPlanCreditsAmount } from "../plans";
import { processWebhookEventOnce } from "../processedWebhookEvent";
import { syncUserSubscription } from "../subscription";
import { recordUserPayment, updateUserPaymentProcessorUserId } from "../user";
import type {
  LemonSqueezyOrder,
  LemonSqueezySubscription,
  LemonSqueezySubscriptionInvoice,
} from "./lemonSqueezyTypes";
import { fetchLemonSqueezySubscriptionState } from "./subscriptionState";

/**
 * Lemon Squeezy requires the raw request body to verify the webhook signature.
 */
export const lemonSqueezyMiddlewareConfigFn: MiddlewareConfigFn = (
  middlewareConfig,
) => {
  middlewareConfig.delete("express.json");
  middlewareConfig.set(
    "express.raw",
    express.raw({ type: "application/json" }),
  );

  return middlewareConfig;
};

export const lemonSqueezyWebhook: PaymentsWebhook = async (
  request,
  response,
  context,
) => {
  try {
    const event = constructLemonSqueezyEvent(request);

    await handleLemonSqueezyEvent(
      event,
      context.entities.User,
      context.entities.ProcessedWebhookEvent,
    );
    return response.status(200).json({ received: true });
  } catch (error) {
    if (error instanceof UnhandledWebhookEventError) {
      // In development, it is likely that we will receive events that we are not handling.
      if (process.env.NODE_ENV === "development") {
        console.info(
          "Unhandled Lemon Squeezy webhook event in development: ",
          error,
        );
      } else if (process.env.NODE_ENV === "production") {
        console.error(
          "Unhandled Lemon Squeezy webhook event in production: ",
          error,
        );
      }

      // We must return a 200 status code, otherwise Lemon Squeezy will keep retrying the event.
      return response.status(200).json({ error: error.message });
    }

    console.error("Lemon Squeezy webhook error: ", error);
    if (error instanceof HttpError) {
      return response.status(error.statusCode).json({ error: error.message });
    } else if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    } else {
      return response
        .status(500)
        .json({ error: "Error processing Lemon Squeezy webhook event" });
    }
  }
};

function constructLemonSqueezyEvent(
  request: express.Request,
): LemonSqueezyWebhookEvent {
  const signature = request.get("X-Signature");
  if (!signature) {
    throw new HttpError(400, "Lemon Squeezy webhook signature not provided");
  }

  const rawBody: Buffer = request.body;
  if (!isValidLemonSqueezySignature(rawBody, signature)) {
    throw new HttpError(400, "Invalid Lemon Squeezy webhook signature");
  }

  const { meta, data } = JSON.parse(rawBody.toString("utf8"));
  return {
    eventName: meta.event_name,
    userId: meta.custom_data?.user_id,
    data,
  };
}

/**
 * @see https://docs.lemonsqueezy.com/help/webhooks/signing-requests
 */
function isValidLemonSqueezySignature(
  rawBody: Buffer,
  signature: string,
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", env.LEMONSQUEEZY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest();
  const actualSignature = Buffer.from(signature, "hex");

  return (
    actualSignature.length === expectedSignature.length &&
    crypto.timingSafeEqual(actualSignature, expectedSignature)
  );
}

async function handleLemonSqueezyEvent(
  event: LemonSqueezyWebhookEvent,
  userDelegate: PrismaClient["user"],
  processedWebhookEventDelegate: PrismaClient["processedWebhookEvent"],
): Promise<void> {
  if (!isHandledLemonSqueezyEvent(event)) {
    throw new UnhandledWebhookEventError(event.eventName);
  }

  const customerId = event.data.attributes.customer_id.toString();
  await linkUserToLemonSqueezyCustomer(event.userId, customerId, userDelegate);

  if (event.eventName === "order_created") {
    // Payments can't be fetched again, so we record each one once.
    // Lemon Squeezy sends no stable event id, so we deduplicate by order id.
    await processWebhookEventOnce(
      {
        paymentProcessorEventId: `order_created:${event.data.id}`,
        eventType: event.eventName,
      },
      processedWebhookEventDelegate,
      () => handleOrderCreated(event.data, customerId, userDelegate),
    );
  } else if (event.eventName === "subscription_payment_success") {
    await recordUserPayment(
      {
        paymentProcessorUserId: customerId,
        datePaid: new Date(event.data.attributes.created_at),
        numOfCreditsPurchased: 0,
      },
      userDelegate,
    );
  }

  await syncUserSubscription(
    customerId,
    fetchLemonSqueezySubscriptionState,
    userDelegate,
  );
}

function isHandledLemonSqueezyEvent(
  event: LemonSqueezyWebhookEvent,
): event is HandledLemonSqueezyEvent {
  return (HANDLED_LEMON_SQUEEZY_EVENT_NAMES as readonly string[]).includes(
    event.eventName,
  );
}

/**
 * Every event here triggers `syncUserSubscription`.
 * Your Lemon Squeezy webhook must send all of them.
 * See: https://docs.opensaas.sh/guides/deploying/#lemon-squeezy
 */
const HANDLED_LEMON_SQUEEZY_EVENT_NAMES = [
  "order_created",
  "subscription_payment_success",
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
] as const;

type HandledLemonSqueezyEvent =
  | LemonSqueezyWebhookEvent<"order_created", LemonSqueezyOrder>
  | LemonSqueezyWebhookEvent<
      "subscription_payment_success",
      LemonSqueezySubscriptionInvoice
    >
  | LemonSqueezyWebhookEvent<SubscriptionEventName, LemonSqueezySubscription>;

type SubscriptionEventName = Exclude<
  (typeof HANDLED_LEMON_SQUEEZY_EVENT_NAMES)[number],
  "order_created" | "subscription_payment_success"
>;

/**
 * The Lemon Squeezy SDK has no type for webhook events, so we define it here.
 * @see https://docs.lemonsqueezy.com/help/webhooks/webhook-requests
 */
interface LemonSqueezyWebhookEvent<EventName = string, Data = unknown> {
  eventName: EventName;
  // Only present when the checkout was created by the app, see `createLemonSqueezyCheckout`.
  userId?: string;
  data: Data;
}

/**
 * Handles one-time payments.
 * Subscription payments are handled by `subscription_payment_success`.
 */
async function handleOrderCreated(
  order: LemonSqueezyOrder,
  customerId: string,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  if (order.attributes.status !== "paid") {
    return;
  }

  const paymentPlanId = findPaymentPlanIdByPaymentProcessorPlanId(
    order.attributes.first_order_item.variant_id.toString(),
  );
  const numOfCreditsPurchased = paymentPlanId
    ? getPaymentPlanCreditsAmount(paymentPlanId)
    : 0;
  if (numOfCreditsPurchased === 0) {
    return;
  }

  await recordUserPayment(
    {
      paymentProcessorUserId: customerId,
      datePaid: new Date(order.attributes.created_at),
      numOfCreditsPurchased,
    },
    userDelegate,
  );
}

/**
 * Lemon Squeezy creates the customer during checkout, so we learn the customer id here.
 */
async function linkUserToLemonSqueezyCustomer(
  userId: string | undefined,
  customerId: string,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  if (!userId) {
    return;
  }

  await updateUserPaymentProcessorUserId(
    { userId, paymentProcessorUserId: customerId },
    userDelegate,
  );
}
