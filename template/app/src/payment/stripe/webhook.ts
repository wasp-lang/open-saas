import { type MiddlewareConfigFn, HttpError } from 'wasp/server';
import { type PaymentsWebhook } from 'wasp/server/api';
import { type PrismaClient } from '@prisma/client';
import express from 'express';
import { Stripe } from 'stripe';
import { stripe } from './stripeClient';
import { paymentPlans, PaymentPlanId, SubscriptionStatus, PaymentPlanEffect, PaymentPlan } from '../plans';
import { updateUserStripePaymentDetails } from './paymentDetails';
import { emailSender } from 'wasp/server/email';
import { assertUnreachable } from '../../shared/utils';
import { requireNodeEnvVar } from '../../server/utils';
import { z } from 'zod';

export const stripeWebhook: PaymentsWebhook = async (request, response, context) => {
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
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentSucceeded(paymentIntent, prismaUserDelegate);
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

export const stripeMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig) => {
  // We need to delete the default 'express.json' middleware and replace it with 'express.raw' middleware
  // because webhook data in the body of the request as raw JSON, not as JSON in the body of the request.
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};

// Because a checkout session completed could potentially result in a failed payment,
// we can update the user's payment details here, but confirm credits or a subscription
// if the payment succeeds in other, more specific, webhooks.
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  prismaUserDelegate: PrismaClient['user']
) {
  const userStripeId = validateUserStripeIdOrThrow(session.customer);
  const { line_items } = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items'],
  });
  const lineItemPriceId = extractPriceId(line_items);
  const planId = getPlanIdByPriceId(lineItemPriceId);
  const plan = paymentPlans[planId];
  if (plan.effect.kind === 'credits') {
    return;
  }
  const { subscriptionPlan } = getPlanEffectPaymentDetails({ planId, planEffect: plan.effect });

  return updateUserStripePaymentDetails({ userStripeId, subscriptionPlan }, prismaUserDelegate);
}

// This is called when a subscription is purchased or renewed and payment succeeds.
// Invoices are not created for one-time payments, so we handle them in the payment_intent.succeeded webhook.
export async function handleInvoicePaid(invoice: Stripe.Invoice, prismaUserDelegate: PrismaClient['user']) {
  const userStripeId = validateUserStripeIdOrThrow(invoice.customer);
  const datePaid = new Date(invoice.period_start * 1000);
  return updateUserStripePaymentDetails({ userStripeId, datePaid }, prismaUserDelegate);
}

export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  prismaUserDelegate: PrismaClient['user']
) {
  // We handle invoices in the invoice.paid webhook. Invoices exist for subscription payments,
  // but not for one-time payment/credits products which use the Stripe `payment` mode on checkout sessions.
  if (paymentIntent.invoice) {
    return;
  }

  const userStripeId = validateUserStripeIdOrThrow(paymentIntent.customer);
  const datePaid = new Date(paymentIntent.created * 1000);

  // We capture the price id from the payment intent metadata
  // that we passed in when creating the checkout session in checkoutUtils.ts.
  const { metadata } = paymentIntent;

  if (!metadata.priceId) {
    throw new HttpError(400, 'No price id found in payment intent');
  }

  const planId = getPlanIdByPriceId(metadata.priceId);
  const plan = paymentPlans[planId];
  if (plan.effect.kind === 'subscription') {
    return;
  }

  const { numOfCreditsPurchased } = getPlanEffectPaymentDetails({ planId, planEffect: plan.effect });

  return updateUserStripePaymentDetails(
    { userStripeId, numOfCreditsPurchased, datePaid },
    prismaUserDelegate
  );
}

export async function handleCustomerSubscriptionUpdated(
  subscription: Stripe.Subscription,
  prismaUserDelegate: PrismaClient['user']
) {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  let subscriptionStatus: SubscriptionStatus | undefined;

  const priceId = extractPriceId(subscription.items);
  const subscriptionPlan = getPlanIdByPriceId(priceId);

  // There are other subscription statuses, such as `trialing` that we are not handling and simply ignore
  // If you'd like to handle more statuses, you can add more cases above. Make sure to update the `SubscriptionStatus` type in `payment/plans.ts` as well
  if (subscription.status === SubscriptionStatus.Active) {
    subscriptionStatus = subscription.cancel_at_period_end
      ? SubscriptionStatus.CancelAtPeriodEnd
      : SubscriptionStatus.Active;
  } else if (subscription.status === SubscriptionStatus.PastDue) {
    subscriptionStatus = SubscriptionStatus.PastDue;
  }
  if (subscriptionStatus) {
    const user = await updateUserStripePaymentDetails(
      { userStripeId, subscriptionPlan, subscriptionStatus },
      prismaUserDelegate
    );
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
  prismaUserDelegate: PrismaClient['user']
) {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  return updateUserStripePaymentDetails(
    { userStripeId, subscriptionStatus: SubscriptionStatus.Deleted },
    prismaUserDelegate
  );
}

function validateUserStripeIdOrThrow(userStripeId: Stripe.Checkout.Session['customer']): string {
  if (!userStripeId) throw new HttpError(400, 'No customer id');
  if (typeof userStripeId !== 'string') throw new HttpError(400, 'Customer id is not a string');
  return userStripeId;
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

function extractPriceId(items: Stripe.Checkout.Session['line_items'] | Stripe.Subscription['items']) {
  const result = LineItemsPriceSchema.safeParse(items);
  if (!result.success) {
    throw new HttpError(400, 'No price id in stripe event object');
  }
  if (result.data.data.length > 1) {
    throw new HttpError(400, 'More than one item in stripe event object');
  }
  return result.data.data[0].price.id;
}

function getPlanIdByPriceId(priceId: string): PaymentPlanId {
  const planId = Object.values(PaymentPlanId).find(
    (planId) => paymentPlans[planId].getPaymentProcessorPlanId() === priceId
  );
  if (!planId) {
    throw new Error(`No plan with Stripe price id ${priceId}`);
  }
  return planId;
}

function getPlanEffectPaymentDetails({
  planId,
  planEffect,
}: {
  planId: PaymentPlanId;
  planEffect: PaymentPlanEffect;
}): {
  subscriptionPlan: PaymentPlanId | undefined;
  numOfCreditsPurchased: number | undefined;
} {
  switch (planEffect.kind) {
    case 'subscription':
      return { subscriptionPlan: planId, numOfCreditsPurchased: undefined };
    case 'credits':
      return { subscriptionPlan: undefined, numOfCreditsPurchased: planEffect.amount };
    default:
      assertUnreachable(planEffect);
  }
}
