import { Order } from "@polar-sh/sdk/models/components/order.js";
import { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { SubscriptionStatus } from "@polar-sh/sdk/models/components/subscriptionstatus.js";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import express from "express";
import type { MiddlewareConfigFn, PrismaClient } from "wasp/server";
import type { PaymentsWebhook } from "wasp/server/api";
import { requireNodeEnvVar } from "../../server/utils";
import { assertUnreachable } from "../../shared/utils";
import { UnhandledWebhookEventError } from "../errors";
import {
  SubscriptionStatus as OpenSaasSubscriptionStatus,
  PaymentPlanId,
  paymentPlans,
} from "../plans";
import { updateUserSubscription, updateUserCredits } from "./paymentDetails";

export const polarWebhook: PaymentsWebhook = async (req, res, context) => {
  try {
    const polarEvent = constructPolarEvent(req);
    const prismaUserDelegate = context.entities.User;

    switch (polarEvent.type) {
      case "order.paid":
        await handleOrderPaid(polarEvent.data, prismaUserDelegate);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(polarEvent.data, prismaUserDelegate);
        break;
      default:
        throw new UnhandledWebhookEventError(polarEvent.type);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    if (err instanceof UnhandledWebhookEventError) {
      console.error(err.message);
      return res.status(204).json({ error: err.message });
    }

    console.error("Webhook error:", err);
    if (err instanceof WebhookVerificationError) {
      return res.status(400).json({ error: "Invalid signature" });
    } else {
      return res
        .status(500)
        .json({ error: "Error processing Polar webhook event" });
    }
  }
};

export const polarMiddlewareConfigFn: MiddlewareConfigFn = (
  middlewareConfig,
) => {
  // We need to delete the default 'express.json' middleware and replace it with 'express.raw' middleware
  // because webhook data is in the body of the request as raw JSON, not as JSON in the body of the request.
  middlewareConfig.delete("express.json");
  middlewareConfig.set(
    "express.raw",
    express.raw({ type: "application/json" }),
  );

  return middlewareConfig;
};

function constructPolarEvent(
  request: express.Request,
): ReturnType<typeof validateEvent> {
  const secret = requireNodeEnvVar("POLAR_WEBHOOK_SECRET");

  return validateEvent(
    request.body,
    request.headers as Record<string, string>,
    secret,
  );
}

async function handleOrderPaid(
  order: Order,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  assertCustomerExternalIdExists(order.customer.externalId);

  const polarCustomerId = order.customerId;
  const paymentPlanId = getPaymentPlanIdByProductId(order.productId);

  switch (paymentPlanId) {
    case PaymentPlanId.Credits10:
      await updateUserCredits(
        {
          polarCustomerId,
          numOfCreditsPurchased: getProductIdCreditsAmount(order.productId),
          datePaid: order.createdAt,
        },
        userDelegate,
      );
      break;
    case PaymentPlanId.Hobby:
    case PaymentPlanId.Pro:
      await updateUserSubscription(
        {
          polarCustomerId,
          subscriptionPlan: paymentPlanId,
          subscriptionStatus: OpenSaasSubscriptionStatus.Active,
          datePaid: order.createdAt,
        },
        userDelegate,
      );
      break;
    default:
      assertUnreachable(paymentPlanId);
  }

  console.log(
    `Order completed: ${order.id} for customer: ${polarCustomerId}, product: ${order.product.name}`,
  );
}

async function handleSubscriptionUpdated(
  subscription: Subscription,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  assertCustomerExternalIdExists(subscription.customer.externalId);

  const polarCustomerId = subscription.customer.id;
  const subscriptionPlan = getPaymentPlanIdByProductId(subscription.productId);
  let subscriptionStatus = mapPolarToOpenSaasSubscriptionStatus(
    subscription.status,
  );

  if (
    subscriptionStatus === OpenSaasSubscriptionStatus.Active &&
    subscription.cancelAtPeriodEnd
  ) {
    subscriptionStatus = OpenSaasSubscriptionStatus.CancelAtPeriodEnd;
  }

  await updateUserSubscription(
    { polarCustomerId, subscriptionStatus, subscriptionPlan },
    userDelegate,
  );
  console.log(
    `${subscription.product.name} subscription updated for customer: ${polarCustomerId}}`,
  );
}

function assertCustomerExternalIdExists(
  externalId: string | null,
): asserts externalId is string {
  if (!externalId) {
    throw new Error("Customer external ID is required");
  }
}

function mapPolarToOpenSaasSubscriptionStatus(
  polarStatus: SubscriptionStatus,
): OpenSaasSubscriptionStatus {
  const statusMap: Record<SubscriptionStatus, OpenSaasSubscriptionStatus> = {
    active: OpenSaasSubscriptionStatus.Active,
    canceled: OpenSaasSubscriptionStatus.Deleted,
    past_due: OpenSaasSubscriptionStatus.PastDue,
    incomplete_expired: OpenSaasSubscriptionStatus.Deleted,
    incomplete: OpenSaasSubscriptionStatus.PastDue,
    trialing: OpenSaasSubscriptionStatus.Active,
    unpaid: OpenSaasSubscriptionStatus.PastDue,
  };

  return statusMap[polarStatus];
}

function getProductIdCreditsAmount(productId: string): number {
  const planId = getPaymentPlanIdByProductId(productId);
  const plan = paymentPlans[planId];

  if (plan.effect.kind !== "credits") {
    throw new Error(
      `Product ${productId} is not a credit product (plan: ${planId})`,
    );
  }

  return plan.effect.amount;
}

function getPaymentPlanIdByProductId(polarProductId: string): PaymentPlanId {
  for (const [planId, plan] of Object.entries(paymentPlans)) {
    if (plan.getPaymentProcessorPlanId() === polarProductId) {
      return planId as PaymentPlanId;
    }
  }

  throw new Error(`Unknown Polar product ID: ${polarProductId}`);
}
