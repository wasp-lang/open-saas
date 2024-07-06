import type { PrismaUserDelegate, SubscriptionStatusOptions } from '../../shared/types';
import { paymentPlans } from '../stripe/paymentPlans';
import { SubscriptionPlanId } from '../../shared/constants';
import { updateUserStripePaymentDetails } from './stripePaymentDetails';
import { emailSender } from 'wasp/server/email';
import { Stripe } from 'stripe';
import { stripe } from '../stripe/stripeClient';
import { HttpError } from 'wasp/server';
import { z } from 'zod';

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  prismaUserDelegate: PrismaUserDelegate
) {
  const userStripeId = validateUserStripeIdOrThrow(session.customer);
  const { line_items } = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items'],
  });
  console.log('line_items: ', line_items);
  const lineItemPriceId = validateAndUseLineItemData(line_items);

  let subscriptionPlan: SubscriptionPlanId | undefined;
  let numOfCreditsPurchased: number | undefined;
  for (const paymentPlan of Object.values(paymentPlans)) {
    if (paymentPlan.stripePriceID === lineItemPriceId) {
      subscriptionPlan = paymentPlan.subscriptionPlan;
      numOfCreditsPurchased = paymentPlan.credits;
      break;
    }
  }

  return await updateUserStripePaymentDetails(
    { userStripeId, subscriptionPlan, numOfCreditsPurchased, datePaid: new Date() },
    prismaUserDelegate
  );
}

export async function handleInvoicePaid(invoice: Stripe.Invoice, prismaUserDelegate: PrismaUserDelegate) {
  const userStripeId = validateUserStripeIdOrThrow(invoice.customer);
  const datePaid = new Date(invoice.period_start * 1000);
  return await updateUserStripePaymentDetails({ userStripeId, datePaid }, prismaUserDelegate);
}

export async function handleCustomerSubscriptionUpdated(
  subscription: Stripe.Subscription,
  prismaUserDelegate: PrismaUserDelegate
) {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  let subscriptionStatus: SubscriptionStatusOptions | undefined;

  switch (subscription.status as Stripe.Subscription.Status) {
    case 'active':
      subscriptionStatus = 'active';
      break;
    case 'past_due':
      subscriptionStatus = 'past_due';
      break;
  }
  if (subscription.cancel_at_period_end) {
    subscriptionStatus = 'cancel_at_period_end';
  }
  if (!subscriptionStatus) throw new HttpError(400, 'Subscription status not handled');

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
}

export async function handleCustomerSubscriptionDeleted(
  subscription: Stripe.Subscription,
  prismaUserDelegate: PrismaUserDelegate
) {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  return await updateUserStripePaymentDetails({ userStripeId, subscriptionStatus: 'deleted' }, prismaUserDelegate);
}

const LineItemsPriceSchema = z.object({
  data: z.array(
    z.object({
      price: z.object({
        id: z.string(),
      }),
    })
  ),
});

function validateAndUseLineItemData(line_items: Stripe.ApiList<Stripe.LineItem> | undefined) {
  const result = LineItemsPriceSchema.safeParse(line_items);

  if (!result.success) {
    throw new HttpError(400, 'No price id in line item');
  }
  if (result.data.data.length > 1) {
    throw new HttpError(400, 'More than one line item in session');
  }
  return result.data.data[0].price.id;
}

function validateUserStripeIdOrThrow(userStripeId: Stripe.Checkout.Session['customer']) {
  if (!userStripeId) throw new HttpError(400, 'No customer id');
  if (typeof userStripeId !== 'string') throw new HttpError(400, 'Customer id is not a string');
  return userStripeId;
}
