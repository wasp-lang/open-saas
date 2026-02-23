import { requireNodeEnvVar } from "../server/utils";
import { type PaymentPlan, PaymentPlanId } from "./plans";

const paymentProcessorPlanIds = {
  [PaymentPlanId.Hobby]: requireNodeEnvVar("PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID"),
  [PaymentPlanId.Pro]: requireNodeEnvVar("PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID"),
  [PaymentPlanId.Credits10]: requireNodeEnvVar("PAYMENTS_CREDITS_10_PLAN_ID"),
} as const satisfies Record<PaymentPlanId, string>;

export function getPaymentProcessorPlanIdByPaymentPlan(paymentPlan: PaymentPlan): string {
  return paymentProcessorPlanIds[paymentPlan.id];
}

/**
 * Returns Open SaaS `PaymentPlanId` for some payment provider's plan ID.
 *
 * Different payment providers track plan ID in different ways.
 * e.g. Stripe price ID, Polar product ID...
 */
export function getPaymentPlanIdByPaymentProcessorPlanId(
  paymentProcessorPlanId: string,
): PaymentPlanId {
  for (const [planId, processorPlanId] of Object.entries(paymentProcessorPlanIds)) {
    if (processorPlanId === paymentProcessorPlanId) {
      return planId as PaymentPlanId;
    }
  }

  throw new Error(
    `Unknown payment processor plan ID: ${paymentProcessorPlanId}`,
  );
}
