import { PaymentPlanId, SubscriptionPlanId } from "../../shared/constants";


interface PaymentPlan {
  stripePriceID: string | undefined;
  subscriptionPlan?: SubscriptionPlanId;
  credits: number;
  mode: 'subscription' | 'payment' 
}

export const paymentPlans: Record<PaymentPlanId, PaymentPlan> = {
  // TODO: check if ENV VARS are set in the .env file
  hobby: {
    stripePriceID: process.env.STRIPE_HOBBY_SUBSCRIPTION_PRICE_ID,
    subscriptionPlan: SubscriptionPlanId.Hobby,
    credits: 0,
    mode: 'subscription',
  },
  pro: {
    stripePriceID: process.env.STRIPE_PRO_SUBSCRIPTION_PRICE_ID,
    subscriptionPlan: SubscriptionPlanId.Hobby,
    credits: 0,
    mode: 'subscription',
  },
  credits10: {
    stripePriceID: process.env.STRIPE_CREDITS_PRICE_ID,
    credits: 10,
    mode: 'payment',
  },
};

export function getStripePriceIdForPaymentPlanId(paymentPlanId: PaymentPlanId): string | undefined {
  return paymentPlans[paymentPlanId].stripePriceID;
}

export function getModeForPaymentPlanId(paymentPlanId: PaymentPlanId): 'subscription' | 'payment' {
  return paymentPlans[paymentPlanId].mode;
}