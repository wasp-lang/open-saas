import type {
  Order,
  Subscription,
  SubscriptionInvoice,
} from "@lemonsqueezy/lemonsqueezy.js";
import crypto from "crypto";
import express from "express";
import {
  env,
  HttpError,
  type MiddlewareConfigFn,
  type PrismaClient,
} from "wasp/server";
import type { PaymentsWebhook } from "wasp/server/api";
import { assertUnreachable } from "../../shared/utils";
import { UnhandledWebhookEventError } from "../errors";
import { getPaymentPlanIdByPaymentProcessorPlanId } from "../paymentProcessorPlans";
import { PaymentPlanId, paymentPlans, SubscriptionStatus } from "../plans";
import { processWebhookEventOnce } from "../processedWebhookEvent";
import {
  updateUserCredits,
  updateUserPaymentProcessorUserId,
  updateUserSubscription,
} from "../user";

/**
 * The Lemon Squeezy SDK has no type for webhook events, so we define it here.
 * @see https://docs.lemonsqueezy.com/help/webhooks/webhook-requests
 */
interface LemonSqueezyWebhookEvent<Data = unknown> {
  meta: {
    event_name: string;
    // Only present when the checkout was created by the app, see `createLemonSqueezyCheckout`.
    custom_data?: { user_id: string };
  };
  data: Data;
}

type LemonSqueezyOrderEvent = LemonSqueezyWebhookEvent<Order["data"]>;
type LemonSqueezySubscriptionEvent = LemonSqueezyWebhookEvent<
  Subscription["data"]
>;
type LemonSqueezySubscriptionInvoiceEvent = LemonSqueezyWebhookEvent<
  SubscriptionInvoice["data"]
>;
type LemonSqueezySubscriptionStatus =
  Subscription["data"]["attributes"]["status"];

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

  return JSON.parse(rawBody.toString("utf8"));
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
  // If you'd like to handle more events, you can add more cases below.
  // When deploying your app, you configure your webhook in the Lemon Squeezy dashboard
  // to only send the events that you're handling below.
  // See: https://docs.opensaas.sh/guides/deploying/#lemon-squeezy
  switch (event.meta.event_name) {
    case "order_created": {
      const orderEvent = event as LemonSqueezyOrderEvent;
      // Lemon Squeezy doesn't send a stable event id, so we deduplicate by the order id.
      // Only this event needs it, since it adds credits. The other events set absolute
      // values, so processing them more than once is harmless.
      await processWebhookEventOnce(
        {
          paymentProcessorEventId: `order_created:${orderEvent.data.id}`,
          eventType: orderEvent.meta.event_name,
        },
        processedWebhookEventDelegate,
        () => handleOrderCreated(orderEvent, userDelegate),
      );
      break;
    }
    case "subscription_payment_success":
      await handleSubscriptionPaymentSuccess(
        event as LemonSqueezySubscriptionInvoiceEvent,
        userDelegate,
      );
      break;
    // Every subscription event carries the whole subscription, so we handle them the same way.
    case "subscription_created":
    case "subscription_updated":
    case "subscription_cancelled":
    case "subscription_resumed":
    case "subscription_expired":
    case "subscription_paused":
    case "subscription_unpaused":
      await handleSubscriptionChange(
        event as LemonSqueezySubscriptionEvent,
        userDelegate,
      );
      break;
    default:
      throw new UnhandledWebhookEventError(event.meta.event_name);
  }
}

/**
 * Handles one-time payments.
 * Subscription payments are handled by `subscription_payment_success`.
 */
async function handleOrderCreated(
  { meta, data: order }: LemonSqueezyOrderEvent,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  const customerId = order.attributes.customer_id.toString();
  await linkUserToLemonSqueezyCustomer(meta, customerId, userDelegate);

  if (order.attributes.status !== "paid") {
    return;
  }

  const paymentPlanId = getPaymentPlanIdByPaymentProcessorPlanId(
    order.attributes.first_order_item.variant_id.toString(),
  );

  switch (paymentPlanId) {
    case PaymentPlanId.Credits10:
      await updateUserCredits(
        {
          paymentProcessorUserId: customerId,
          numOfCreditsPurchased: paymentPlans[paymentPlanId].effect.amount,
          datePaid: new Date(order.attributes.created_at),
        },
        userDelegate,
      );
      break;
    case PaymentPlanId.Hobby:
    case PaymentPlanId.Pro:
      break;
    default:
      assertUnreachable(paymentPlanId);
  }
}

async function handleSubscriptionPaymentSuccess(
  { meta, data: subscriptionInvoice }: LemonSqueezySubscriptionInvoiceEvent,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  const customerId = subscriptionInvoice.attributes.customer_id.toString();
  await linkUserToLemonSqueezyCustomer(meta, customerId, userDelegate);

  await updateUserSubscription(
    {
      paymentProcessorUserId: customerId,
      subscriptionStatus: SubscriptionStatus.Active,
      datePaid: new Date(subscriptionInvoice.attributes.created_at),
    },
    userDelegate,
  );
}

async function handleSubscriptionChange(
  { meta, data: subscription }: LemonSqueezySubscriptionEvent,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  const customerId = subscription.attributes.customer_id.toString();
  await linkUserToLemonSqueezyCustomer(meta, customerId, userDelegate);

  const subscriptionStatus = getOpenSaasSubscriptionStatus(
    subscription.attributes.status,
  );
  if (!subscriptionStatus) {
    return;
  }

  const paymentPlanId = getPaymentPlanIdByPaymentProcessorPlanId(
    subscription.attributes.variant_id.toString(),
  );

  await updateUserSubscription(
    {
      paymentProcessorUserId: customerId,
      subscriptionStatus,
      paymentPlanId,
    },
    userDelegate,
  );
}

/**
 * Lemon Squeezy creates the customer during checkout, so we only learn the customer id from the webhook.
 * We use the user id we passed as custom data at checkout to save it on the user.
 */
async function linkUserToLemonSqueezyCustomer(
  meta: LemonSqueezyWebhookEvent["meta"],
  customerId: string,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  const userId = meta.custom_data?.user_id;
  if (!userId) {
    return;
  }

  await updateUserPaymentProcessorUserId(
    { userId, paymentProcessorUserId: customerId },
    userDelegate,
  );
}

function getOpenSaasSubscriptionStatus(
  lemonSqueezySubscriptionStatus: LemonSqueezySubscriptionStatus,
): SubscriptionStatus | undefined {
  const lemonSqueezyToOpenSaasSubscriptionStatus: Record<
    LemonSqueezySubscriptionStatus,
    SubscriptionStatus | undefined
  > = {
    on_trial: SubscriptionStatus.Active,
    active: SubscriptionStatus.Active,
    // Lemon Squeezy's `cancelled` subscriptions stay valid until the end of the billing period.
    cancelled: SubscriptionStatus.CancelAtPeriodEnd,
    past_due: SubscriptionStatus.PastDue,
    unpaid: SubscriptionStatus.Deleted,
    expired: SubscriptionStatus.Deleted,
    // Pausing has to be enabled in the Lemon Squeezy dashboard.
    // If you enable it, decide how paused subscriptions should be handled here.
    paused: undefined,
    // The SDK's status type also lists `pause`, which the API docs don't mention.
    pause: undefined,
  };

  return lemonSqueezyToOpenSaasSubscriptionStatus[
    lemonSqueezySubscriptionStatus
  ];
}
