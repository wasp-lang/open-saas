import Stripe from 'stripe';
import type {
  CreateCheckoutSessionArgs,
  FetchCustomerPortalUrlArgs,
  PaymentProcessor,
} from '../paymentProcessor';
import type { PaymentPlanEffect } from '../plans';
import { createStripeCheckoutSession, ensureStripeCustomer } from './checkoutUtils';
import { stripeClient } from './stripeClient';
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
  fetchCustomerPortalUrl: async (args: FetchCustomerPortalUrlArgs) => {
    const user = await args.prismaUserDelegate.findUniqueOrThrow({
      where: {
        id: args.userId,
      },
      select: {
        paymentProcessorUserId: true,
      },
    });

    if (!user.paymentProcessorUserId) {
      return null;
    }

    const CLIENT_BASE_URL = process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000';
    const session = await stripeClient.billingPortal.sessions.create({
      customer: user.paymentProcessorUserId,
      return_url: `${CLIENT_BASE_URL}/account`,
    });

    return session.url;
  },
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
