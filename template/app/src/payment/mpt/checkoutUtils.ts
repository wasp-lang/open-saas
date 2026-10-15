import { getPaymentProcessorPlanId } from "../paymentProcessorPlans";
import type { PaymentPlan } from "../plans";

const EUR_AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

/**
 * MPT has no product catalog: a payment intent is just an amount. So for MPT,
 * the `PAYMENTS_*_PLAN_ID` env vars hold the plan's price in EUR, e.g. `9.99`.
 */
export function getMptPlanAmountEur(paymentPlan: PaymentPlan): string {
  const amountEur = getPaymentProcessorPlanId(paymentPlan);
  if (!EUR_AMOUNT_RE.test(amountEur)) {
    throw new Error(
      `MPT plan "${paymentPlan.id}" needs a EUR price as its plan ID (e.g. "9.99"), got "${amountEur}"`,
    );
  }
  return amountEur;
}
