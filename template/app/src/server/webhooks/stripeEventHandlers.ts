import type { PrismaUserDelegate, SubscriptionStatusOptions } from '../../shared/types';
import { Stripe } from 'stripe';
import { stripe } from '../stripe/stripeClient';
import { SubscriptionPlanId } from '../../shared/constants';
import { updateUserStripePaymentDetails } from './userStripePaymentDetails';
import { HttpError } from 'wasp/server';
import { emailSender } from 'wasp/server/email';

const getCustomerIdStringOrThrow = (userStripeId: unknown): string => {
  if (!userStripeId) throw new HttpError(400, 'No customer id in session');
  if (typeof userStripeId !== 'string') throw new HttpError(400, 'Customer id is not a string');
  return userStripeId;
};

export const handleCheckoutSessionCompleted = async (event: Stripe.Event, prismaUserDelegate: PrismaUserDelegate) => {
  let session = event.data.object as Stripe.Checkout.Session;
  const userStripeId = getCustomerIdStringOrThrow(session.customer);
  const { line_items } = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items'],
  });
  const lineItemPriceId = line_items?.data[0]?.price?.id;
  if (!lineItemPriceId) throw new HttpError(400, 'No line item price id');

  let subscriptionPlan: SubscriptionPlanId | undefined;
  let numOfCreditsPurchased: number | undefined;
  switch (lineItemPriceId) {
    case process.env.STRIPE_HOBBY_SUBSCRIPTION_PRICE_ID:
      subscriptionPlan = SubscriptionPlanId.HOBBY;
      break;
    case process.env.STRIPE_PRO_SUBSCRIPTION_PRICE_ID:
      subscriptionPlan = SubscriptionPlanId.PRO;
      break;
    case process.env.STRIPE_CREDITS_PRICE_ID:
      numOfCreditsPurchased = 10;
      break;
  }

  return await updateUserStripePaymentDetails(
    { userStripeId, subscriptionPlan: subscriptionPlan, numOfCreditsPurchased, datePaid: new Date() },
    prismaUserDelegate
  );
};

export const handleInvoicePaid = async (event: Stripe.Event, prismaUserDelegate: PrismaUserDelegate) => {
  const invoice = event.data.object as Stripe.Invoice;
  const userStripeId = getCustomerIdStringOrThrow(invoice.customer);
  const periodStart = new Date(invoice.period_start * 1000);
  return await updateUserStripePaymentDetails({ userStripeId, datePaid: periodStart }, prismaUserDelegate);
};

export const handleCustomerSubscriptionUpdated = async (event: Stripe.Event, prismaUserDelegate: PrismaUserDelegate) => {
  const subscription = event.data.object as Stripe.Subscription;
  const userStripeId = getCustomerIdStringOrThrow(subscription.customer);

  let subscriptionStatus: SubscriptionStatusOptions = 'active';
  if (subscription.status === 'past_due') subscriptionStatus = 'past_due';
  if (subscription.cancel_at_period_end) subscriptionStatus = 'canceled';

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

export const handleCustomerSubscriptionDeleted = async (event: Stripe.Event, prismaUserDelegate: PrismaUserDelegate) => {
  const subscription = event.data.object as Stripe.Subscription;
  const userStripeId = getCustomerIdStringOrThrow(subscription.customer);

  await updateUserStripePaymentDetails({ userStripeId, subscriptionStatus: 'deleted' }, prismaUserDelegate);
};
