import { type GenerateStripeCheckoutSession } from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { PaymentPlanId, paymentPlans, type PaymentPlanEffect } from '../payment/plans';
import { fetchStripeCustomer, createStripeCheckoutSession, type StripeMode } from './stripe/checkoutUtils';

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
