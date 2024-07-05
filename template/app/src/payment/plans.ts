
export enum SubscriptionPlanId {
  Hobby = 'hobby',
  Pro = 'pro'
}

export enum CreditsPlanId {
  Credits10 = 'credits10'
}

export type PaymentPlanId = SubscriptionPlanId | CreditsPlanId
export const paymentPlanIds: PaymentPlanId[] = [...Object.values(SubscriptionPlanId), ...Object.values(CreditsPlanId)];


export function getPaymentPlanStripePriceId (planId: PaymentPlanId): string {
  const planToPriceId: Record<PaymentPlanId, string> = {
    [SubscriptionPlanId.Hobby]: requireNodeEnvVar('STRIPE_HOBBY_SUBSCRIPTION_PRICE_ID'),
    [SubscriptionPlanId.Pro]: requireNodeEnvVar('STRIPE_PRO_SUBSCRIPTION_PRICE_ID'),
    [CreditsPlanId.Credits10]: requireNodeEnvVar('STRIPE_CREDITS_PRICE_ID'),
  };
  return planToPriceId[planId];
}

export function getCreditsPlanAmount (planId: CreditsPlanId): number {
  const planToAmount: Record<CreditsPlanId, number> = {
    [CreditsPlanId.Credits10]: 10,
  };
  return planToAmount[planId];
}

// TODO: Move to some server/utils.js?
function requireNodeEnvVar(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Env var ${name} is undefined`);
  } else {
    return value;
  }
}

export function parseSubscriptionPlanId(planId: string): SubscriptionPlanId {
  if ((Object.values(SubscriptionPlanId) as string[]).includes(planId)) {
    return planId as SubscriptionPlanId;
  } else {
    throw new Error(`Invalid SubscriptionPlanId: ${planId}`);
  }
}

export function getSubscriptionPaymentPlanIds(): SubscriptionPlanId[] {
  return Object.values(SubscriptionPlanId);
}

export function isSubscriptionPlan(planId: PaymentPlanId): planId is SubscriptionPlanId {
  return (Object.values(SubscriptionPlanId) as string[]).includes(planId);
}

export function isCreditsPlan(planId: PaymentPlanId): planId is CreditsPlanId {
  return (Object.values(CreditsPlanId) as string[]).includes(planId);
}
