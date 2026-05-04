import { type PrismaClient } from "@prisma/client";
import express from "express";
import { Webhook } from "standardwebhooks";
import { type MiddlewareConfigFn } from "wasp/server";
import { type PaymentsWebhook } from "wasp/server/api";
import { requireNodeEnvVar } from "../../server/utils";
import { assertUnreachable } from "../../shared/utils";
import { UnhandledWebhookEventError } from "../errors";
import {
  getPaymentPlanIdByPaymentProcessorPlanId,
  PaymentPlanId,
  paymentPlans,
  SubscriptionStatus,
} from "../plans";
import {
  updateUserCredits,
  updateUserPaymentProcessorUserId,
  updateUserSubscription,
} from "../user";

/**
 * MDK webhooks use standardwebhooks for signature verification,
 * which requires the raw request body.
 */
export const mdkMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig) => {
  middlewareConfig.delete("express.json");
  middlewareConfig.set("express.raw", express.raw({ type: "application/json" }));
  return middlewareConfig;
};

interface MdkSubscription {
  id: string;
  customerId: string;
  customerEmail: string | null;
  productId: string;
  amount: number;
  currency: "USD" | "SAT";
  recurringInterval: "MONTH" | "QUARTER" | "YEAR";
  status: "active" | "past_due" | "canceled";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  startedAt: string;
  cancelAtPeriodEnd?: boolean;
  endsAt?: string;
  endedAt?: string;
  canceledAt?: string;
}

interface MdkCheckoutData {
  id: string;
  customerId?: string;
  customerEmail?: string;
  productId?: string;
  metadata?: Record<string, string>;
}

type MdkWebhookEvent =
  | { type: "checkout.completed"; data: MdkCheckoutData }
  | { type: "subscription.created"; data: { subscription: MdkSubscription } }
  | { type: "subscription.renewed"; data: { subscription: MdkSubscription } }
  | { type: "subscription.canceled"; data: { subscription: MdkSubscription } }
  | { type: "subscription.payment_failed"; data: { subscription: MdkSubscription } };

export const mdkWebhook: PaymentsWebhook = async (request, response, context) => {
  const prismaUserDelegate = context.entities.User;

  try {
    const event = verifyMdkWebhook(request);

    switch (event.type) {
      case "checkout.completed":
        await handleCheckoutCompleted(event.data, prismaUserDelegate);
        break;
      case "subscription.created":
        await handleSubscriptionCreated(event.data.subscription, prismaUserDelegate);
        break;
      case "subscription.renewed":
        await handleSubscriptionRenewed(event.data.subscription, prismaUserDelegate);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(event.data.subscription, prismaUserDelegate);
        break;
      default:
        throw new UnhandledWebhookEventError((event as { type: string }).type);
    }

    return response.status(204).send();
  } catch (error) {
    if (error instanceof UnhandledWebhookEventError) {
      if (process.env.NODE_ENV === "development") {
        console.info("Unhandled MDK webhook event in development: ", error);
      } else if (process.env.NODE_ENV === "production") {
        console.error("Unhandled MDK webhook event in production: ", error);
      }
      return response.status(204).send();
    }

    console.error("MDK webhook error:", error);
    if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    } else {
      return response.status(500).json({ error: "Error processing MDK webhook event" });
    }
  }
};

function verifyMdkWebhook(request: express.Request): MdkWebhookEvent {
  const webhookSecret = requireNodeEnvVar("MDK_WEBHOOK_SECRET");

  const webhookId = request.headers["webhook-id"] as string | undefined;
  const webhookTimestamp = request.headers["webhook-timestamp"] as string | undefined;
  const webhookSignature = request.headers["webhook-signature"] as string | undefined;

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    throw new Error("Missing webhook verification headers");
  }

  const wh = new Webhook(webhookSecret);
  const payload = wh.verify(request.body, {
    "webhook-id": webhookId,
    "webhook-timestamp": webhookTimestamp,
    "webhook-signature": webhookSignature,
  }) as MdkWebhookEvent;

  return payload;
}

/**
 * Handle checkout.completed — for one-time purchases (e.g., credits).
 * Finds the user by metadata.userId (with email fallback) and updates their credits.
 */
async function handleCheckoutCompleted(
  data: MdkCheckoutData,
  prismaUserDelegate: PrismaClient["user"],
): Promise<void> {
  const userId = data.metadata?.userId ?? null;

  let user;
  if (userId) {
    user = await prismaUserDelegate.findUnique({ where: { id: userId } });
  }
  if (!user && data.customerEmail) {
    user = await prismaUserDelegate.findFirst({
      where: { email: data.customerEmail },
    });
  }
  if (!user) {
    throw new Error(
      `Could not find user for checkout ${data.id} (userId: ${userId}, email: ${data.customerEmail})`,
    );
  }

  // Store the MDK customer ID if we have one and the user doesn't have one yet
  if (data.customerId && !user.paymentProcessorUserId) {
    await updateUserPaymentProcessorUserId(
      { userId: user.id, paymentProcessorUserId: data.customerId },
      prismaUserDelegate,
    );
  }

  if (!data.productId) {
    return;
  }

  const paymentPlanId = getPaymentPlanIdByPaymentProcessorPlanId(data.productId);

  switch (paymentPlanId) {
    case PaymentPlanId.Credits10:
      await updateUserCredits(
        {
          paymentProcessorUserId: data.customerId || `user_${user.id}`,
          numOfCreditsPurchased: paymentPlans[paymentPlanId].effect.amount,
          datePaid: new Date(),
        },
        prismaUserDelegate,
      );
      break;
    case PaymentPlanId.Pro:
    case PaymentPlanId.Hobby:
      // Subscriptions are handled by subscription.created
      break;
    default:
      assertUnreachable(paymentPlanId);
  }
}

/**
 * Handle subscription.created — store MDK customerId, set subscription active.
 */
async function handleSubscriptionCreated(
  subscription: MdkSubscription,
  prismaUserDelegate: PrismaClient["user"],
): Promise<void> {
  // First, find the user by customerId or email
  let user = await prismaUserDelegate.findFirst({
    where: { paymentProcessorUserId: subscription.customerId },
  });

  if (!user && subscription.customerEmail) {
    user = await prismaUserDelegate.findFirst({
      where: { email: subscription.customerEmail },
    });
  }

  if (!user) {
    throw new Error(
      `Could not find user for subscription ${subscription.id} (customerId: ${subscription.customerId})`,
    );
  }

  // Store the MDK customer ID
  if (user.paymentProcessorUserId !== subscription.customerId) {
    await updateUserPaymentProcessorUserId(
      { userId: user.id, paymentProcessorUserId: subscription.customerId },
      prismaUserDelegate,
    );
  }

  const paymentPlanId = getPaymentPlanIdByPaymentProcessorPlanId(
    subscription.productId,
  );

  await updateUserSubscription(
    {
      paymentProcessorUserId: subscription.customerId,
      paymentPlanId,
      subscriptionStatus: SubscriptionStatus.Active,
      datePaid: new Date(),
    },
    prismaUserDelegate,
  );
}

/**
 * Handle subscription.renewed — keep subscription active, update datePaid.
 */
async function handleSubscriptionRenewed(
  subscription: MdkSubscription,
  prismaUserDelegate: PrismaClient["user"],
): Promise<void> {
  const paymentPlanId = getPaymentPlanIdByPaymentProcessorPlanId(
    subscription.productId,
  );

  await updateUserSubscription(
    {
      paymentProcessorUserId: subscription.customerId,
      paymentPlanId,
      subscriptionStatus: SubscriptionStatus.Active,
      datePaid: new Date(),
    },
    prismaUserDelegate,
  );
}

/**
 * Handle subscription.canceled — set status based on cancelAtPeriodEnd.
 */
async function handleSubscriptionCanceled(
  subscription: MdkSubscription,
  prismaUserDelegate: PrismaClient["user"],
): Promise<void> {
  const subscriptionStatus = subscription.cancelAtPeriodEnd
    ? SubscriptionStatus.CancelAtPeriodEnd
    : SubscriptionStatus.Deleted;

  await updateUserSubscription(
    {
      paymentProcessorUserId: subscription.customerId,
      subscriptionStatus,
    },
    prismaUserDelegate,
  );
}
