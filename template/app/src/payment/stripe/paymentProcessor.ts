import Stripe from 'stripe';
import { requireNodeEnvVar } from '../../server/utils';
import type {
  CreateCheckoutSessionArgs,
  FetchCustomerPortalUrlArgs,
  PaymentProcessor,
} from '../paymentProcessor';
import type { PaymentPlanEffect } from '../plans';
import { createStripeCheckoutSession, ensureStripeCustomer } from './checkoutUtils';
import { stripeMiddlewareConfigFn, stripeWebhook } from './webhook';

export const stripePaymentProcessor: PaymentProcessor = {
  id: 'stripe',
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate,
  }: CreateCheckoutSessionArgs) => {
    const customer = await ensureStripeCustomer(userEmail);

    await prismaUserDelegate.update({
      where: {
        id: userId,
      },
      data: {
        paymentProcessorUserId: customer.id,
      },
    });

    const stripeSession = await createStripeCheckoutSession({
      customerId: customer.id,
      priceId: paymentPlan.getPaymentProcessorPlanId(),
      mode: paymentPlanEffectToStripeCheckoutSessionMode(paymentPlan.effect),
    });

    if (!stripeSession.url) {
      throw new Error('Stripe checkout session URL is missing. Checkout session might not be active.');
    }

    return {
      session: {
        url: stripeSession.url,
        id: stripeSession.id,
      },
    };
  },
  fetchCustomerPortalUrl: async (_args: FetchCustomerPortalUrlArgs) =>
    requireNodeEnvVar('STRIPE_CUSTOMER_PORTAL_URL'),
  webhook: stripeWebhook,
  webhookMiddlewareConfigFn: stripeMiddlewareConfigFn,
};

function paymentPlanEffectToStripeCheckoutSessionMode(
  planEffect: PaymentPlanEffect
): Stripe.Checkout.Session.Mode {
  const effectToMode: Record<PaymentPlanEffect['kind'], Stripe.Checkout.Session.Mode> = {
    subscription: 'subscription',
    credits: 'payment',
  };
  return effectToMode[planEffect.kind];
}
