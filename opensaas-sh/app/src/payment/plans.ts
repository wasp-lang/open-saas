import { requireNodeEnvVar } from '../server/utils';

export type SubscriptionStatus = 'past_due' | 'cancel_at_period_end' | 'active' | 'deleted';

export enum PaymentPlanId {
  Hobby = 'hobby',
  Pro = 'pro',
  Credits10 = 'credits10',
}

export interface PaymentPlan {
  getStripePriceId: () => string;
  effect: PaymentPlanEffect;
}

export type PaymentPlanEffect = { kind: 'subscription' } | { kind: 'credits'; amount: number };

export const paymentPlans: Record<PaymentPlanId, PaymentPlan> = {
  [PaymentPlanId.Hobby]: {
    getStripePriceId: () => requireNodeEnvVar('STRIPE_HOBBY_SUBSCRIPTION_PRICE_ID'),
    effect: { kind: 'subscription' },
  },
  [PaymentPlanId.Pro]: {
    getStripePriceId: () => requireNodeEnvVar('STRIPE_PRO_SUBSCRIPTION_PRICE_ID'),
    effect: { kind: 'subscription' },
  },
  [PaymentPlanId.Credits10]: {
    getStripePriceId: () => requireNodeEnvVar('STRIPE_CREDITS_PRICE_ID'),
    effect: { kind: 'credits', amount: 10 },
  },
};

export function prettyPaymentPlanName(planId: PaymentPlanId): string {
  const planToName: Record<PaymentPlanId, string> = {
    [PaymentPlanId.Hobby]: 'Hobby',
    [PaymentPlanId.Pro]: 'Pro',
    [PaymentPlanId.Credits10]: '10 Credits',
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
  return Object.values(PaymentPlanId).filter((planId) => paymentPlans[planId].effect.kind === 'subscription');
}
