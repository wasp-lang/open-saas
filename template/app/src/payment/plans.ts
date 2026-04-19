export enum SubscriptionStatus {
  PastDue = "past_due",
  CancelAtPeriodEnd = "cancel_at_period_end",
  Active = "active",
  Deleted = "deleted",
}

export enum PaymentPlanId {
  Starter = "starter",
  Professional = "professional",
  Enterprise = "enterprise",
  Credits25 = "credits25",
  Credits100 = "credits100",
  Credits500 = "credits500",
}

export interface PaymentPlan {
  id: PaymentPlanId;
  effect: PaymentPlanEffect;
}

export type PaymentPlanEffect =
  | { kind: "subscription"; creditsPerMonth: number }
  | { kind: "credits"; amount: number };

export const paymentPlans = {
  [PaymentPlanId.Starter]: {
    id: PaymentPlanId.Starter,
    effect: { kind: "subscription", creditsPerMonth: 50 },
  },
  [PaymentPlanId.Professional]: {
    id: PaymentPlanId.Professional,
    effect: { kind: "subscription", creditsPerMonth: 250 },
  },
  [PaymentPlanId.Enterprise]: {
    id: PaymentPlanId.Enterprise,
    effect: { kind: "subscription", creditsPerMonth: 1500 },
  },
  [PaymentPlanId.Credits25]: {
    id: PaymentPlanId.Credits25,
    effect: { kind: "credits", amount: 25 },
  },
  [PaymentPlanId.Credits100]: {
    id: PaymentPlanId.Credits100,
    effect: { kind: "credits", amount: 100 },
  },
  [PaymentPlanId.Credits500]: {
    id: PaymentPlanId.Credits500,
    effect: { kind: "credits", amount: 500 },
  },
} as const satisfies Record<PaymentPlanId, PaymentPlan>;

export function prettyPaymentPlanName(planId: PaymentPlanId): string {
  const planToName: Record<PaymentPlanId, string> = {
    [PaymentPlanId.Starter]: "Starter",
    [PaymentPlanId.Professional]: "Professional",
    [PaymentPlanId.Enterprise]: "Enterprise",
    [PaymentPlanId.Credits25]: "25 Credits",
    [PaymentPlanId.Credits100]: "100 Credits",
    [PaymentPlanId.Credits500]: "500 Credits",
  };
  return planToName[planId];
}

export function parsePaymentPlanId(planId: string): PaymentPlanId {
  if ((Object.values(PaymentPlanId) as string[]).includes(planId)) {
    return planId as PaymentPlanId;
  } else {
    throw new Error(`Invalid PaymentPlanId: ${planId}`);
  }
}

export function getSubscriptionPaymentPlanIds(): PaymentPlanId[] {
  return Object.values(PaymentPlanId).filter(
    (planId) => paymentPlans[planId].effect.kind === "subscription",
  );
}
