import { type MiddlewareConfigFn, HttpError } from 'wasp/server';
import { type StripeWebhook } from 'wasp/server/api';
import { type PrismaClient } from '@prisma/client';
import express from 'express';
import { Stripe } from 'stripe';
import { stripe } from './stripeClient';
import { paymentPlans, PaymentPlanId, SubscriptionStatus } from '../plans';
import { updateUserStripePaymentDetails } from './paymentDetails';
import { emailSender } from 'wasp/server/email';
import { assertUnreachable } from '../../shared/utils';
import { requireNodeEnvVar } from '../../server/utils';
import { z } from 'zod';

export const stripeWebhook: StripeWebhook = async (request, response, context) => {
  const secret = requireNodeEnvVar('STRIPE_WEBHOOK_SECRET');
  const sig = request.headers['stripe-signature'];
  if (!sig) {
    throw new HttpError(400, 'Stripe Webhook Signature Not Provided');
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, secret);
  } catch (err) {
    throw new HttpError(400, 'Error Constructing Stripe Webhook Event');
  }
  const prismaUserDelegate = context.entities.User;
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session, prismaUserDelegate);
      break;
    case 'invoice.paid':
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoice, prismaUserDelegate);
      break;
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      await handleCustomerSubscriptionUpdated(updatedSubscription, prismaUserDelegate);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleCustomerSubscriptionDeleted(deletedSubscription, prismaUserDelegate);
      break;
    default:
      // If you'd like to handle more events, you can add more cases above.
      // When deploying your app, you configure your webhook in the Stripe dashboard to only send the events that you're
      // handling above and that are necessary for the functioning of your app. See: https://docs.opensaas.sh/guides/deploying/#setting-up-your-stripe-webhook 
      // In development, it is likely that you will receive other events that you are not handling, and that's fine. These can be ignored without any issues.
      console.error('Unhandled event type: ', event.type);
  }
  response.json({ received: true }); // Stripe expects a 200 response to acknowledge receipt of the webhook
};

// This allows us to override Wasp's defaults and parse the raw body of the request from Stripe to verify the signature
export const stripeMiddlewareFn: MiddlewareConfigFn = (middlewareConfig) => {
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};

const LineItemsPriceSchema = z.object({
  data: z.array(
    z.object({
      price: z.object({
        id: z.string(),
      }),
    })
  ),
});

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  prismaUserDelegate: PrismaClient["user"]
) {
  const userStripeId = validateUserStripeIdOrThrow(session.customer);
  const { line_items } = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items'],
  });
  const result = LineItemsPriceSchema.safeParse(line_items);
  if (!result.success) {
    throw new HttpError(400, 'No price id in line item');
  }
  if (result.data.data.length > 1) {
    throw new HttpError(400, 'More than one line item in session');
  }
  const lineItemPriceId =  result.data.data[0].price.id;

  const planId = Object.values(PaymentPlanId).find(
    (planId) => paymentPlans[planId].getStripePriceId() === lineItemPriceId
  );
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
      assertUnreachable(plan.effect);
  }

  return updateUserStripePaymentDetails(
    { userStripeId, subscriptionPlan, numOfCreditsPurchased, datePaid: new Date() },
    prismaUserDelegate
  );
}

export async function handleInvoicePaid(invoice: Stripe.Invoice, prismaUserDelegate: PrismaClient["user"]) {
  const userStripeId = validateUserStripeIdOrThrow(invoice.customer);
  const datePaid = new Date(invoice.period_start * 1000);
  return updateUserStripePaymentDetails({ userStripeId, datePaid }, prismaUserDelegate);
}

export async function handleCustomerSubscriptionUpdated(
  subscription: Stripe.Subscription,
  prismaUserDelegate: PrismaClient["user"]
) {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  let subscriptionStatus: SubscriptionStatus | undefined;

  // There are other subscription statuses, such as `trialing` that we are not handling and simply ignore
  // If you'd like to handle more statuses, you can add more cases above. Make sure to update the `SubscriptionStatus` type in `payment/plans.ts` as well
  if (subscription.status === 'active') {
    subscriptionStatus = subscription.cancel_at_period_end ? 'cancel_at_period_end' : 'active';
  } else if (subscription.status === 'past_due') {
    subscriptionStatus = 'past_due';
  } 
  if (subscriptionStatus) {
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
}

export async function handleCustomerSubscriptionDeleted(
  subscription: Stripe.Subscription,
  prismaUserDelegate: PrismaClient["user"]
) {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  return updateUserStripePaymentDetails({ userStripeId, subscriptionStatus: 'deleted' }, prismaUserDelegate);
}

function validateUserStripeIdOrThrow(userStripeId: Stripe.Checkout.Session['customer']): string {
  if (!userStripeId) throw new HttpError(400, 'No customer id');
  if (typeof userStripeId !== 'string') throw new HttpError(400, 'Customer id is not a string');
  return userStripeId;
}
