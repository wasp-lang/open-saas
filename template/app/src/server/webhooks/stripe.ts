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

export const stripeWebhook: StripeWebhook = async (request, response, context) => {
  const sig = request.headers['stripe-signature'];
  if (!sig) {
    throw new HttpError(400, 'Stripe Webhook Signature Not Provided');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    throw new HttpError(400, 'Error Constructing Stripe Webhook Event');
  }

  const prismaUserDelegate = context.entities.User;
  if (event.type === 'checkout.session.completed') {
    await handleCheckoutSessionCompleted(event, prismaUserDelegate);
  } else if (event.type === 'invoice.paid') {
    await handleInvoicePaid(event, prismaUserDelegate);
  } else if (event.type === 'customer.subscription.updated') {
    await handleCustomerSubscriptionUpdated(event, prismaUserDelegate);
  } else if (event.type === 'customer.subscription.deleted') {
    await handleCustomerSubscriptionDeleted(event, prismaUserDelegate);
  }
  response.json({ received: true }); // Stripe expects a 200 response to acknowledge receipt of the webhook
};

// This allows us to override Wasp's defaults and parse the raw body of the request from Stripe to verify the signature
export const stripeMiddlewareFn: MiddlewareConfigFn = (middlewareConfig) => {
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};
