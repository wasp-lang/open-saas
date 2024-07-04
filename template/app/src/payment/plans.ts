
export enum PaymentPlanId {
  Hobby = 'hobby',
  Pro = 'pro',
  Credits10 = 'credits10'
}

export interface PaymentPlan {
  stripePriceId: string,
  effect: PaymentPlanEffect
}

export type PaymentPlanEffect = { kind: 'subscription' } | { kind: 'credits', amount: number }
export type PaymentPlanEffectKinds = PaymentPlanEffect extends { kind: infer K } ? K : never;

export const paymentPlans: Record<PaymentPlanId, PaymentPlan> = {
  [PaymentPlanId.Hobby]: {
    stripePriceId: requireNodeEnvVar('STRIPE_HOBBY_SUBSCRIPTION_PRICE_ID'),
    effect: { kind: 'subscription' }
  },
  [PaymentPlanId.Pro]: {
    stripePriceId: requireNodeEnvVar('STRIPE_PRO_SUBSCRIPTION_PRICE_ID'),
    effect: { kind: 'subscription' }
  },
  [PaymentPlanId.Credits10]: {
    stripePriceId: requireNodeEnvVar('STRIPE_CREDITS_PRICE_ID'),
    effect: { kind: 'credits', amount: 10 }
  }
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

export function parsePaymentPlanId(planId: string): PaymentPlanId {
  if ((Object.values(PaymentPlanId) as string[]).includes(planId)) {
    return planId as PaymentPlanId;
  } else {
    throw new Error(`Invalid PaymentPlanId: ${planId}`);
  }
}

export function getSubscriptionPaymentPlanIds(): PaymentPlanId[] {
  return Object.values(PaymentPlanId).filter(planId => paymentPlans[planId].effect.kind === 'subscription');
}
