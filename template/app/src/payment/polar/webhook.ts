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
import { updateUserCredits, updateUserSubscription } from "./user";

/**
 * Polar requires a raw request to construct events successfully.
 */
export const polarMiddlewareConfigFn: MiddlewareConfigFn = (
  middlewareConfig,
) => {
  middlewareConfig.delete("express.json");
  middlewareConfig.set(
    "express.raw",
    express.raw({ type: "application/json" }),
  );

  return middlewareConfig;
};

export const polarWebhook: PaymentsWebhook = async (
  request,
  response,
  context,
) => {
  const prismaUserDelegate = context.entities.User;
  try {
    const polarEvent = constructPolarEvent(request);

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
    return response.status(204).send();
  } catch (error) {
    if (error instanceof UnhandledWebhookEventError) {
      if (process.env.NODE_ENV === "development") {
        console.info("Unhandled Polar webhook event in development: ", error);
      } else if (process.env.NODE_ENV === "production") {
        console.error("Unhandled Polar webhook event in production: ", error);
      }

      return response.status(200).json({ error: error.message });
    }

    console.error("Polar webhook error: ", error);
    if (error instanceof WebhookVerificationError) {
      return response.status(400).json({ error: "Invalid signature" });
    } else {
      return response
        .status(500)
        .json({ error: "Error processing Polar webhook event" });
    }
  }
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

  const paymentPlanId = getPaymentPlanIdByProductId(order.productId);
  switch (paymentPlanId) {
    case PaymentPlanId.Credits10:
      await updateUserCredits(
        {
          customerId: order.customerId,
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
          customerId: order.customerId,
          paymentPlanId,
          subscriptionStatus: OpenSaasSubscriptionStatus.Active,
          datePaid: order.createdAt,
        },
        userDelegate,
      );
      break;
    default:
      assertUnreachable(paymentPlanId);
  }
}

async function handleSubscriptionUpdated(
  subscription: Subscription,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  assertCustomerExternalIdExists(subscription.customer.externalId);

  const paymentPlanId = getPaymentPlanIdByProductId(subscription.productId);
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
    {
      customerId: subscription.customer.id,
      subscriptionStatus,
      paymentPlanId: paymentPlanId,
    },
    userDelegate,
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
  polarSubscriptionStatus: SubscriptionStatus,
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

  return statusMap[polarSubscriptionStatus];
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
