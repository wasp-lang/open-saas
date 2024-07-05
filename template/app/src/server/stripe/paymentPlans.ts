import { PaymentPlanId, SubscriptionPlanId } from "../../shared/constants";

interface PaymentPlan {
  id: PaymentPlanId;
  stripePriceID: string | undefined;
  subscriptionPlan?: SubscriptionPlanId;
  pricePerMonth?: string;
  price?: string;
  credits: number;
  mode: 'subscription' | 'payment' 
  description?: string;
  features?: string[];
}

export const paymentPlans: Record<PaymentPlanId, PaymentPlan> = {
  // TODO: check if ENV VARS are set in the .env file
  hobby: {
    id: PaymentPlanId.SubscriptionHobby,
    stripePriceID: process.env.STRIPE_HOBBY_SUBSCRIPTION_PRICE_ID,
    subscriptionPlan: SubscriptionPlanId.Hobby,
    credits: 0,
    mode: 'subscription',
  },
  pro: {
    id: PaymentPlanId.SubscriptionPro,
    stripePriceID: process.env.STRIPE_PRO_SUBSCRIPTION_PRICE_ID,
    subscriptionPlan: SubscriptionPlanId.Hobby,
    credits: 0,
    mode: 'subscription',
  },
  credits10: {
    id: PaymentPlanId.Credits10,
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