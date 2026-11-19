import { PaymentPlanId, paymentPlans } from "../plans";

// The template's 10-credit pack is priced in USD major units, not cents/tokens.
// Keep the displayed PricingPage card in sync if changing this price.
export const yolfiCreditPack = {
  paymentPlanId: PaymentPlanId.Credits10,
  amount: "9.99",
  currency: "USD",
} as const;

export function yolfiCredits(): number {
  const plan = paymentPlans[yolfiCreditPack.paymentPlanId];
  if (
    plan.effect.kind !== "credits" ||
    !Number.isSafeInteger(plan.effect.amount) ||
    plan.effect.amount <= 0
  ) {
    throw new Error("Yolfi requires a one-time credit plan");
  }
  return plan.effect.amount;
}
