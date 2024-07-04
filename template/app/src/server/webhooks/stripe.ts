import { type MiddlewareConfigFn, HttpError } from 'wasp/server';
import { type StripeWebhook } from 'wasp/server/api';
import express from 'express';
import { Stripe } from 'stripe';
import { stripe } from '../stripe/stripeClient';
import {
  handleCheckoutSessionCompleted,
  handleInvoicePaid,
  handleCustomerSubscriptionDeleted,
  handleCustomerSubscriptionUpdated,
} from './stripeEventHandlers';

type StripeEventTypes =
  | 'checkout.session.completed'
  | 'invoice.paid'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted';

export const stripeWebhook: StripeWebhook = async (request, response, context) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.length <= 9) {
    throw new HttpError(500, 'Stripe Webhook Secret Not Set');
  }
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
  switch (event.type as StripeEventTypes) {
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
      console.log('Unhandled event type: ', event.type);
  }
  response.json({ received: true }); // Stripe expects a 200 response to acknowledge receipt of the webhook
};

// This allows us to override Wasp's defaults and parse the raw body of the request from Stripe to verify the signature
export const stripeMiddlewareFn: MiddlewareConfigFn = (middlewareConfig) => {
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};
