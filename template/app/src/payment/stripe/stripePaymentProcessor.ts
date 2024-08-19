import { fetchStripeCustomer, createStripeCheckoutSession } from './checkoutUtils';
import type { PaymentPlan, PaymentPlanEffect } from '../plans';

export type StripeMode = 'subscription' | 'payment';

export const stripePaymentProcessor = {
  createCheckoutSession: async ({ userEmail, paymentPlan }: { userEmail: string; paymentPlan: PaymentPlan }) => {
    const customer = await fetchStripeCustomer(userEmail);
    if (!customer.id) throw new Error('Error fetching Stripe Customer for Checkout Session');
    const stripeSession = await createStripeCheckoutSession({
      priceId: paymentPlan.getProductId(),
      customerId: customer.id,
      mode: paymentPlanEffectToStripeMode(paymentPlan.effect),
    });
    if (!stripeSession.url || !stripeSession.id) throw new Error('Error creating Stripe Checkout Session');
    const session = {
      url: stripeSession.url,
      id: stripeSession.id,
    };
    return { session, customer };
  },
};

function paymentPlanEffectToStripeMode(planEffect: PaymentPlanEffect): StripeMode {
  const effectToMode: Record<PaymentPlanEffect['kind'], StripeMode> = {
    subscription: 'subscription',
    credits: 'payment',
  };
  return effectToMode[planEffect.kind];
}
