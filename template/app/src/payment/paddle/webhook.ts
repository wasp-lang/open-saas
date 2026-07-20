import {
  EventName,
  type SubscriptionNotification,
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
import { assertUnreachable } from "../../shared/utils";
import { UnhandledWebhookEventError } from "../errors";
import { getPaymentPlanIdByPaymentProcessorPlanId } from "../paymentProcessorPlans";
import {
  SubscriptionStatus as OpenSaasSubscriptionStatus,
  PaymentPlanId,
  paymentPlans,
} from "../plans";
import { updateUserCredits, updateUserSubscription } from "../user";
import { paddleClient } from "./paddleClient";

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
  const prismaUserDelegate = context.entities.User;
  try {
    const signature = request.get("paddle-signature");
    if (!signature) {
      throw new HttpError(400, "Missing Paddle-Signature header");
    }

    const event = await paddleClient.webhooks.unmarshal(
      request.body.toString(),
      env.PADDLE_WEBHOOK_SECRET,
      signature,
    );

    switch (event.eventType) {
      // `transaction.completed` is the settlement signal for BOTH one-time
      // purchases and subscription payments (initial + renewals), so it's where
      // we fulfill credits and (re)activate subscriptions.
      case EventName.TransactionCompleted:
        await handleTransactionCompleted(event.data, prismaUserDelegate);
        break;
      // Subscription lifecycle changes (status transitions, scheduled cancels).
      case EventName.SubscriptionUpdated:
      case EventName.SubscriptionCanceled:
        await handleSubscriptionChange(event.data, prismaUserDelegate);
        break;
      default:
        throw new UnhandledWebhookEventError(event.eventType);
    }

    return response.status(200).json({ received: true });
  } catch (error) {
    if (error instanceof UnhandledWebhookEventError) {
      // In development it's normal to receive events we don't handle.
      if (process.env.NODE_ENV === "development") {
        console.info("Unhandled Paddle webhook event in development: ", error);
      } else if (process.env.NODE_ENV === "production") {
        console.error("Unhandled Paddle webhook event in production: ", error);
      }
      // We must return a 2XX status code, otherwise Paddle keeps retrying the event.
      return response.status(200).json({ error: error.message });
    }

    console.error("Paddle webhook error: ", error);
    if (error instanceof HttpError) {
      return response.status(error.statusCode).json({ error: error.message });
    } else {
      return response
        .status(500)
        .json({ error: "Error processing Paddle webhook event" });
    }
  }
};

async function handleTransactionCompleted(
  transaction: TransactionNotification,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  if (!transaction.customerId) {
    throw new Error(`Paddle transaction ${transaction.id} has no customer ID`);
  }

  const priceId = transaction.items[0]?.price?.id;
  if (!priceId) {
    throw new Error(`Paddle transaction ${transaction.id} has no price ID`);
  }

  const paymentPlanId = getPaymentPlanIdByPaymentProcessorPlanId(priceId);
  const datePaid = new Date();

  switch (paymentPlanId) {
    case PaymentPlanId.Credits10:
      await updateUserCredits(
        {
          paymentProcessorUserId: transaction.customerId,
          numOfCreditsPurchased: paymentPlans[paymentPlanId].effect.amount,
          datePaid,
        },
        userDelegate,
      );
      break;
    case PaymentPlanId.Hobby:
    case PaymentPlanId.Pro:
      await updateUserSubscription(
        {
          paymentProcessorUserId: transaction.customerId,
          paymentPlanId,
          subscriptionStatus: OpenSaasSubscriptionStatus.Active,
          datePaid,
        },
        userDelegate,
      );
      break;
    default:
      assertUnreachable(paymentPlanId);
  }
}

async function handleSubscriptionChange(
  subscription: SubscriptionNotification,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  const subscriptionStatus = getOpenSaasSubscriptionStatus(subscription);
  const priceId = subscription.items[0]?.price?.id;
  const paymentPlanId = priceId
    ? getPaymentPlanIdByPaymentProcessorPlanId(priceId)
    : undefined;

  await updateUserSubscription(
    {
      paymentProcessorUserId: subscription.customerId,
      subscriptionStatus,
      paymentPlanId,
    },
    userDelegate,
  );
}

/**
 * Maps a Paddle subscription onto our internal `SubscriptionStatus`. An active
 * subscription with a scheduled cancellation maps to `CancelAtPeriodEnd`, since
 * the customer keeps access until the change takes effect.
 */
function getOpenSaasSubscriptionStatus(
  subscription: SubscriptionNotification,
): OpenSaasSubscriptionStatus {
  if (
    subscription.status === "active" &&
    subscription.scheduledChange?.action === "cancel"
  ) {
    return OpenSaasSubscriptionStatus.CancelAtPeriodEnd;
  }

  switch (subscription.status) {
    case "active":
    case "trialing":
      return OpenSaasSubscriptionStatus.Active;
    case "past_due":
    case "paused":
      return OpenSaasSubscriptionStatus.PastDue;
    case "canceled":
      return OpenSaasSubscriptionStatus.Deleted;
    default:
      return OpenSaasSubscriptionStatus.PastDue;
  }
}
