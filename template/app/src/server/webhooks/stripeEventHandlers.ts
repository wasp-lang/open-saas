import type { PrismaUserDelegate, SubscriptionStatusOptions } from '../../shared/types';
import { Stripe } from 'stripe';
import { stripe } from '../stripe/stripeClient';
import { paymentPlans, PaymentPlanId } from '../../payment/plans';
import { updateUserStripePaymentDetails } from './stripePaymentDetails';
import { HttpError } from 'wasp/server';
import { emailSender } from 'wasp/server/email';

const validateUserStripeIdOrThrow = (userStripeId: Stripe.Checkout.Session['customer']) => {
  if (!userStripeId) throw new HttpError(400, 'No customer id');
  if (typeof userStripeId !== 'string') throw new HttpError(400, 'Customer id is not a string');
  return userStripeId;
}

export const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session, prismaUserDelegate: PrismaUserDelegate) => {
  const userStripeId = validateUserStripeIdOrThrow(session.customer);
  const { line_items } = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items'],
  });
  if (!line_items?.data?.length) throw new HttpError(400, 'No line items');
  if (line_items.data.length > 1) throw new HttpError(400, 'More than one line item in session');
  const lineItemPriceId = line_items?.data[0]?.price?.id;
  if (!lineItemPriceId) throw new HttpError(400, 'No price id in line item');

  const planId = Object.values(PaymentPlanId).find(planId => paymentPlans[planId].stripePriceId === lineItemPriceId);
  if (!planId) {
    throw new Error(`No plan with stripe price id ${lineItemPriceId}`);
  }
  const plan = paymentPlans[planId];

  let subscriptionPlan: PaymentPlanId | undefined;
  let numOfCreditsPurchased: number | undefined;
  switch (plan.effect.kind) {
    case 'subscription':
      subscriptionPlan = planId;
      break;
    case 'credits':
      numOfCreditsPurchased = plan.effect.amount;
      break;
    default:
      const exhaustiveCheck: never = plan.effect;
      throw new Error(`Unhandled case: ${exhaustiveCheck}`);
  }

  return await updateUserStripePaymentDetails(
    { userStripeId, subscriptionPlan, numOfCreditsPurchased, datePaid: new Date() },
    prismaUserDelegate
  );
};

export const handleInvoicePaid = async (invoice: Stripe.Invoice, prismaUserDelegate: PrismaUserDelegate) => {
  const userStripeId = validateUserStripeIdOrThrow(invoice.customer);
  const datePaid = new Date(invoice.period_start * 1000);
  return await updateUserStripePaymentDetails({ userStripeId, datePaid }, prismaUserDelegate);
};

export const handleCustomerSubscriptionUpdated = async (subscription: Stripe.Subscription, prismaUserDelegate: PrismaUserDelegate) => {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer)

  const statusMapping: Record<string, SubscriptionStatusOptions> = {
    active: 'active',
    past_due: 'past_due',
    cancel_at_period_end: 'cancel_at_period_end',
  };
  let subscriptionStatus = statusMapping[subscription.status];
  if (subscription.cancel_at_period_end) {
    subscriptionStatus = 'cancel_at_period_end';
  }

  const user = await updateUserStripePaymentDetails({ userStripeId, subscriptionStatus }, prismaUserDelegate);

  if (subscription.cancel_at_period_end) {
    if (user.email) {
      await emailSender.send({
        to: user.email,
        subject: 'We hate to see you go :(',
        text: 'We hate to see you go. Here is a sweet offer...',
        html: 'We hate to see you go. Here is a sweet offer...',
      });
    }
  }

  return user;
};

export const handleCustomerSubscriptionDeleted = async (subscription: Stripe.Subscription, prismaUserDelegate: PrismaUserDelegate) => {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  return await updateUserStripePaymentDetails({ userStripeId, subscriptionStatus: 'deleted' }, prismaUserDelegate);
};
