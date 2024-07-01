import { emailSender } from 'wasp/server/email';
import { type MiddlewareConfigFn, HttpError } from 'wasp/server';
import { type StripeWebhook } from 'wasp/server/api';
import express from 'express';
import { PaymentPlanIds } from '../../shared/constants';
import { Stripe } from 'stripe';
import { stripe } from '../stripe/stripeClient';
import { type SubscriptionStatusOptions } from '../../shared/types';
import { updateUserPaymentDetails } from '../stripe/webhookUtils';

export const stripeWebhook: StripeWebhook = async (request, response, context) => {
  const sig = request.headers['stripe-signature'];
  if (!sig) {
    throw new HttpError(400, 'Stripe Webhook Signature Not Provided');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    // console.table({sig: 'stripe webhook signature verified', type: event.type})
  } catch (err) {
    throw new HttpError(400, 'Error Constructing Stripe Webhook Event');
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { line_items } = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });
      const lineItemPriceId = line_items?.data[0]?.price?.id;
      const userStripeId = session.customer as string;
      let subscriptionTier: PaymentPlanIds | undefined;
      let numOfCreditsPurchased: number | undefined;

      if (!lineItemPriceId) throw new HttpError(400, 'No line item price id');
      switch (lineItemPriceId) {
        case process.env.STRIPE_HOBBY_SUBSCRIPTION_PRICE_ID:
          subscriptionTier = PaymentPlanIds.HOBBY;
          break;
        case process.env.STRIPE_PRO_SUBSCRIPTION_PRICE_ID:
          subscriptionTier = PaymentPlanIds.PRO;
          break;
        case process.env.STRIPE_CREDITS_PRICE_ID:
          numOfCreditsPurchased = 10;
          break;
      }

      await updateUserPaymentDetails(
        {
          userStripeId,
          subscriptionTier,
          numOfCreditsPurchased,
          datePaid: new Date(),
        },
        context
      );
    } else if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const userStripeId = invoice.customer as string;
      const periodStart = new Date(invoice.period_start * 1000);

      await updateUserPaymentDetails(
        {
          userStripeId,
          datePaid: periodStart,
        },
        context
      );
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const userStripeId = subscription.customer as string;

      let subscriptionStatus: SubscriptionStatusOptions = 'active';
      if (subscription.status === 'past_due') subscriptionStatus = 'past_due';
      if (subscription.cancel_at_period_end) subscriptionStatus = 'canceled';

      const user = await updateUserPaymentDetails(
        {
          userStripeId,
          subscriptionStatus,
        },
        context
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
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const userStripeId = subscription.customer as string;

      await updateUserPaymentDetails(
        {
          userStripeId,
          subscriptionStatus: 'deleted',
        },
        context
      );
    }
    response.json({ received: true }); // Stripe expects a 200 response to acknowledge receipt of the webhook
  } catch (err) {
    console.error(err);
    response.status(400).send('Webhook Error');
  }
};

// This allows us to override Wasp's defaults and parse the raw body of the request from Stripe to verify the signature
export const stripeMiddlewareFn: MiddlewareConfigFn = (middlewareConfig) => {
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};
