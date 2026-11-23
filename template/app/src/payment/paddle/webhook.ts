import {
  EventName,
  type TransactionNotification,
} from "@paddle/paddle-node-sdk";
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
import { recordUserPayment } from "../user";
import { paddleApi } from "./paddleApi";
import { fetchPaddleSubscriptionState } from "./subscriptionState";

type PaddleWebhookEvent = Awaited<
  ReturnType<typeof paddleApi.webhooks.unmarshal>
>;

/**
 * Paddle requires the raw request body to verify the webhook signature.
 */
export const paddleMiddlewareConfigFn: MiddlewareConfigFn = (
  middlewareConfig,
) => {
  middlewareConfig.delete("express.json");
  middlewareConfig.set(
    "express.raw",
    express.raw({ type: "application/json" }),
  );

  return middlewareConfig;
};

export const paddleWebhook: PaymentsWebhook = async (
  request,
  response,
  context,
) => {
  try {
    const signature = request.get("paddle-signature");
    if (!signature) {
      throw new HttpError(400, "Missing Paddle-Signature header");
    }

    const event = await paddleApi.webhooks.unmarshal(
      request.body.toString(),
      env.PADDLE_WEBHOOK_SECRET,
      signature,
    );

    await handlePaddleEvent(
      event,
      context.entities.User,
      context.entities.ProcessedWebhookEvent,
    );
    return response.status(200).json({ received: true });
  } catch (error) {
    if (error instanceof UnhandledWebhookEventError) {
      // In development, it is likely that we will receive events that we are not handling.
      if (process.env.NODE_ENV === "development") {
        console.info("Unhandled Paddle webhook event in development: ", error);
      } else if (process.env.NODE_ENV === "production") {
        console.error("Unhandled Paddle webhook event in production: ", error);
      }

      // We must return a 2XX status code, otherwise Paddle will keep retrying the event.
      return response.status(200).json({ error: error.message });
    }

    console.error("Paddle webhook error: ", error);
    if (error instanceof HttpError) {
      return response.status(error.statusCode).json({ error: error.message });
    } else if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    } else {
      return response
        .status(500)
        .json({ error: "Error processing Paddle webhook event" });
    }
  }
};

async function handlePaddleEvent(
  event: PaddleWebhookEvent,
  userDelegate: PrismaClient["user"],
  processedWebhookEventDelegate: PrismaClient["processedWebhookEvent"],
): Promise<void> {
  if (!isHandledPaddleEvent(event)) {
    throw new UnhandledWebhookEventError(event.eventType);
  }

  if (event.eventType === EventName.TransactionCompleted) {
    // Payments can't be fetched again, so we record each one once.
    await processWebhookEventOnce(
      { paymentProcessorEventId: event.eventId, eventType: event.eventType },
      processedWebhookEventDelegate,
      () => handleTransactionCompleted(event.data, userDelegate),
    );
  }

  const customerId = event.data.customerId;
  if (!customerId) {
    return;
  }

  await syncUserSubscription(
    customerId,
    fetchPaddleSubscriptionState,
    userDelegate,
  );
}

function isHandledPaddleEvent(
  event: PaddleWebhookEvent,
): event is HandledPaddleEvent {
  return (HANDLED_PADDLE_EVENT_TYPES as readonly EventName[]).includes(
    event.eventType,
  );
}

/**
 * Every event here triggers `syncUserSubscription`.
 * Your Paddle webhook must send all of them.
 * See: https://docs.opensaas.sh/guides/deploying/#paddle
 */
const HANDLED_PADDLE_EVENT_TYPES = [
  EventName.TransactionCompleted,
  EventName.SubscriptionCreated,
  EventName.SubscriptionUpdated,
  EventName.SubscriptionActivated,
  EventName.SubscriptionTrialing,
  EventName.SubscriptionPastDue,
  EventName.SubscriptionPaused,
  EventName.SubscriptionResumed,
  EventName.SubscriptionCanceled,
] as const satisfies EventName[];

type HandledPaddleEvent = Extract<
  PaddleWebhookEvent,
  { eventType: (typeof HANDLED_PADDLE_EVENT_TYPES)[number] }
>;

async function handleTransactionCompleted(
  transaction: TransactionNotification,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  // Updating a payment method creates a zero-value transaction, which isn't a payment.
  if (transaction.origin === "subscription_payment_method_change") {
    return;
  }

  if (!transaction.customerId) {
    throw new Error(`Paddle transaction ${transaction.id} has no customer ID`);
  }

  await recordUserPayment(
    {
      paymentProcessorUserId: transaction.customerId,
      datePaid: new Date(transaction.billedAt ?? transaction.createdAt),
      numOfCreditsPurchased: getNumOfCreditsPurchased(transaction),
    },
    userDelegate,
  );
}

function getNumOfCreditsPurchased(
  transaction: TransactionNotification,
): number {
  let numOfCreditsPurchased = 0;
  for (const transactionItem of transaction.items) {
    const priceId = transactionItem.price?.id;
    const paymentPlanId =
      priceId && findPaymentPlanIdByPaymentProcessorPlanId(priceId);
    if (paymentPlanId) {
      numOfCreditsPurchased += getPaymentPlanCreditsAmount(paymentPlanId);
    }
  }

  return numOfCreditsPurchased;
}
