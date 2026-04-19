import { env } from "wasp/server";
import { type PaymentPlan, PaymentPlanId } from "./plans";

/**
 * The ID under which this payment plan is identified on your payment processor.
 *
 * E.g. price id on Stripe, or variant id on LemonSqueezy.
 */
export const paymentProcessorPlanIds = {
  [PaymentPlanId.Starter]: env.PAYMENTS_STARTER_SUBSCRIPTION_PLAN_ID,
  [PaymentPlanId.Professional]: env.PAYMENTS_PROFESSIONAL_SUBSCRIPTION_PLAN_ID,
  [PaymentPlanId.Enterprise]: env.PAYMENTS_ENTERPRISE_SUBSCRIPTION_PLAN_ID,
  [PaymentPlanId.Credits25]: env.PAYMENTS_CREDITS_25_PLAN_ID,
  [PaymentPlanId.Credits100]: env.PAYMENTS_CREDITS_100_PLAN_ID,
  [PaymentPlanId.Credits500]: env.PAYMENTS_CREDITS_500_PLAN_ID,
} as const satisfies Record<PaymentPlanId, string>;

/**
 * Returns your payment processor plan ID for a given Open SaaS `PaymentPlan`.
 */
export function getPaymentProcessorPlanId(paymentPlan: PaymentPlan): string {
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
  for (const [planId, processorPlanId] of Object.entries(
    paymentProcessorPlanIds,
  )) {
    if (processorPlanId === paymentProcessorPlanId) {
      return planId as PaymentPlanId;
    }
  }

  throw new Error(
    `Unknown payment processor plan ID: ${paymentProcessorPlanId}`,
  );
}
