import type { PaymentPlanEffect } from '../plans';
import type { CreateCheckoutSessionArgs, FetchCustomerPortalUrlArgs } from '../paymentProcessor'
import { fetchStripeCustomer, createStripeCheckoutSession } from './checkoutUtils';
import { requireNodeEnvVar } from '../../server/utils';

export type StripeMode = 'subscription' | 'payment';

export const stripePaymentProcessor = {
  createCheckoutSession: async ({ userEmail, paymentPlan }: CreateCheckoutSessionArgs) => {
    const customer = await fetchStripeCustomer(userEmail);
    const stripeSession = await createStripeCheckoutSession({
      priceId: paymentPlan.getPriceId(),
      customerId: customer.id,
      mode: paymentPlanEffectToStripeMode(paymentPlan.effect),
    });
    if (!stripeSession.url) throw new Error('Error creating Stripe Checkout Session');
    const session = {
      url: stripeSession.url,
      id: stripeSession.id,
    };
    return { session, customer };
  },
  fetchCustomerPortalUrl: async (_args?: FetchCustomerPortalUrlArgs) => requireNodeEnvVar('PAYMENTS_STRIPE_CUSTOMER_PORTAL_URL'),
};

function paymentPlanEffectToStripeMode(planEffect: PaymentPlanEffect): StripeMode {
  const effectToMode: Record<PaymentPlanEffect['kind'], StripeMode> = {
    subscription: 'subscription',
    credits: 'payment',
  };
  return effectToMode[planEffect.kind];
}
