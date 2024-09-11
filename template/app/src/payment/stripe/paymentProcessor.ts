import type { PaymentPlanEffect } from '../plans';
import type { CreateCheckoutSessionArgs, FetchCustomerPortalUrlArgs, PaymentProcessor } from '../paymentProcessor'
import { fetchStripeCustomer, createStripeCheckoutSession } from './checkoutUtils';
import { requireNodeEnvVar } from '../../server/utils';
import { stripeWebhook, stripeMiddlewareConfigFn } from './webhook';

export type StripeMode = 'subscription' | 'payment';

export const stripePaymentProcessor: PaymentProcessor = {
  id: 'stripe',
  createCheckoutSession: async ({ userId, userEmail, paymentPlan, prismaUserDelegate }: CreateCheckoutSessionArgs) => {
    const customer = await fetchStripeCustomer(userEmail);
    const stripeSession = await createStripeCheckoutSession({
      userId,
      priceId: paymentPlan.getPaymentProcessorPlanId(),
      customerId: customer.id,
      mode: paymentPlanEffectToStripeMode(paymentPlan.effect),
    });
    await prismaUserDelegate.update({
      where: {
        id: userId
      },
      data: {
        paymentProcessorUserId: customer.id
      }
    })
    if (!stripeSession.url) throw new Error('Error creating Stripe Checkout Session');
    const session = {
      url: stripeSession.url,
      id: stripeSession.id,
    };
    return { session };
  },
  fetchCustomerPortalUrl: async (_args: FetchCustomerPortalUrlArgs) =>
    requireNodeEnvVar('STRIPE_CUSTOMER_PORTAL_URL'),
  webhook: stripeWebhook,
  webhookMiddlewareConfigFn: stripeMiddlewareConfigFn,
};

function paymentPlanEffectToStripeMode(planEffect: PaymentPlanEffect): StripeMode {
  const effectToMode: Record<PaymentPlanEffect['kind'], StripeMode> = {
    subscription: 'subscription',
    credits: 'payment',
  };
  return effectToMode[planEffect.kind];
}
