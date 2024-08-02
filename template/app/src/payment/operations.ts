import { requireNodeEnvVar } from '../server/utils';
import { HttpError } from 'wasp/server';
import type { GenerateStripeCheckoutSession, GenerateLemonSqueezyCheckoutSession } from 'wasp/server/operations';
import { PaymentPlanId, paymentPlans, type PaymentPlanEffect } from '../payment/plans';
import { fetchStripeCustomer, createStripeCheckoutSession, type StripeMode } from './stripe/checkoutUtils';
import { createLemonSqueezyCheckoutSession } from './lemonSqueezy/checkoutUtils';

export type StripeCheckoutSession = {
  sessionUrl: string | null;
  sessionId: string;
};

export const generateStripeCheckoutSession: GenerateStripeCheckoutSession<
  PaymentPlanId,
  StripeCheckoutSession
> = async (paymentPlanId, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  const userEmail = context.user.email;
  if (!userEmail) {
    throw new HttpError(
      403,
      'User needs an email to make a payment. If using the usernameAndPassword Auth method, switch to an Auth method that provides an email.'
    );
  }

  const paymentPlan = paymentPlans[paymentPlanId];
  const customer = await fetchStripeCustomer(userEmail);
  const session = await createStripeCheckoutSession({
    priceId: paymentPlan.getStripePriceId(),
    customerId: customer.id,
    mode: paymentPlanEffectToStripeMode(paymentPlan.effect),
  });

  await context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: {
      checkoutSessionId: session.id,
      stripeId: customer.id,
    },
  });

  return {
    sessionUrl: session.url,
    sessionId: session.id,
  };
};

function paymentPlanEffectToStripeMode(planEffect: PaymentPlanEffect): StripeMode {
  const effectToMode: Record<PaymentPlanEffect['kind'], StripeMode> = {
    subscription: 'subscription',
    credits: 'payment',
  };
  return effectToMode[planEffect.kind];
}

export type LemonSqueezyCheckoutSession = {
  sessionUrl: string | null;
  sessionId: string;
};

export const generateLemonSqueezyCheckoutSession: GenerateLemonSqueezyCheckoutSession<PaymentPlanId, LemonSqueezyCheckoutSession> = async (paymentPlanId, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  if (!context.user.email) {
    throw new HttpError(403, 'User needs an email to make a payment. If using the usernameAndPassword Auth method, switch to an Auth method that provides an email.');
  }
  const storeId = requireNodeEnvVar('LEMONSQUEEZY_STORE_ID');

  const paymentPlan = paymentPlans[paymentPlanId];
  const checkout = await createLemonSqueezyCheckoutSession({
    storeId,
    variantId: paymentPlan.getLemonSqueezyVariantId(),
    userEmail: context.user.email,
    userId: context.user.id,
  });

  await context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: {
      checkoutSessionId: checkout.sessionId,
    },
  });

  return {
    sessionUrl: checkout.sessionUrl,
    sessionId: checkout.sessionId,
  };
};
