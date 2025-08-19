import { requireNodeEnvVar } from '../server/utils';

export enum SubscriptionStatus {
  PastDue = 'past_due',
  CancelAtPeriodEnd = 'cancel_at_period_end',
  Active = 'active',
  Deleted = 'deleted',
}

export enum PaymentPlanId {
  Hobby = 'hobby',
  Pro = 'pro',
  Credits10 = 'credits10',
}

export interface PaymentPlan {
  /**
   * Returns the id under which this payment plan is identified on your payment processor.
   *
   * E.g. this might be price id on Stripe, or variant id on LemonSqueezy.
   */
  getPaymentProcessorPlanId: () => string;
  effect: PaymentPlanEffect;
}

export type PaymentPlanEffect = { kind: 'subscription' } | { kind: 'credits'; amount: number };

export const paymentPlans = {
  [PaymentPlanId.Hobby]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID'),
    effect: { kind: 'subscription' },
  },
  [PaymentPlanId.Pro]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID'),
    effect: { kind: 'subscription' },
  },
  [PaymentPlanId.Credits10]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_CREDITS_10_PLAN_ID'),
    effect: { kind: 'credits', amount: 10 },
  },
} as const satisfies Record<PaymentPlanId, PaymentPlan>;

export function prettyPaymentPlanName(planId: PaymentPlanId): string {
  const planToName: Record<PaymentPlanId, string> = {
    [PaymentPlanId.Hobby]: 'Hobby',
    [PaymentPlanId.Pro]: 'Pro',
    [PaymentPlanId.Credits10]: '10 Credits',
  };
  return planToName[planId];
}

export function getSubscriptionPaymentPlanIds(): PaymentPlanId[] {
  return Object.values(PaymentPlanId).filter((planId) => paymentPlans[planId].effect.kind === 'subscription');
}

export function assertPaymentPlanId(planId: string): asserts planId is PaymentPlanId {
  if (!Object.values(PaymentPlanId).includes(planId as PaymentPlanId)) {
    throw new Error(`Invalid PaymentPlanId: ${planId}`);
  }
}
