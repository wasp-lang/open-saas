import { type MiddlewareConfigFn, HttpError } from 'wasp/server';
import { type PaymentsWebhook } from 'wasp/server/api';
import { type PrismaClient } from '@prisma/client';
import express from 'express';
import type { Stripe } from 'stripe';
import { stripe } from './stripeClient';
import { paymentPlans, PaymentPlanId, SubscriptionStatus, type PaymentPlanEffect } from '../plans';
import { updateUserStripePaymentDetails } from './paymentDetails';
import { emailSender } from 'wasp/server/email';
import { assertUnreachable } from '../../shared/utils';
import { requireNodeEnvVar } from '../../server/utils';
import { z } from 'zod';
import {
  parseWebhookPayload,
  type InvoicePaidData,
  SubscriptionCreatedData,
  type SessionCompletedData,
  type SubscriptionDeletedData,
  type SubscriptionUpdatedData,
} from './webhookPayload';
import { UnhandledWebhookEventError } from '../errors';

export const stripeWebhook: PaymentsWebhook = async (request, response, context) => {
  try {
    const rawStripeEvent = constructStripeEvent(request);
    const { eventName, data } = await parseWebhookPayload(rawStripeEvent);
    const prismaUserDelegate = context.entities.User;
    switch (eventName) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(data, prismaUserDelegate);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(data, prismaUserDelegate);
        break;
      case 'customer.subscription.created':
        await handleCustomerSubscriptionCreated(data, prismaUserDelegate);
        break;
      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(data, prismaUserDelegate);
        break;
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(data, prismaUserDelegate);
        break;
      default:
        // If you'd like to handle more events, you can add more cases above.
        // When deploying your app, you configure your webhook in the Stripe dashboard to only send the events that you're
        // handling above and that are necessary for the functioning of your app. See: https://docs.opensaas.sh/guides/deploying/#setting-up-your-stripe-webhook
        // In development, it is likely that you will receive other events that you are not handling, and that's fine. These can be ignored without any issues.
        assertUnreachable(eventName);
    }
    return response.json({ received: true }); // Stripe expects a 200 response to acknowledge receipt of the webhook
  } catch (err) {
    if (err instanceof UnhandledWebhookEventError) {
      console.error(err.message);
      return response.status(422).json({ error: err.message });
    }

    console.error('Webhook error:', err);
    if (err instanceof HttpError) {
      return response.status(err.statusCode).json({ error: err.message });
    } else {
      return response.status(400).json({ error: 'Error processing Stripe webhook event' });
    }
  }
};

function constructStripeEvent(request: express.Request): Stripe.Event {
  try {
    const secret = requireNodeEnvVar('STRIPE_WEBHOOK_SECRET');
    const sig = request.headers['stripe-signature'];
    if (!sig) {
      throw new HttpError(400, 'Stripe webhook signature not provided');
    }
    return stripe.webhooks.constructEvent(request.body, sig, secret);
  } catch (err) {
    throw new HttpError(500, 'Error constructing Stripe webhook event');
  }
}

export const stripeMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig) => {
  // We need to delete the default 'express.json' middleware and replace it with 'express.raw' middleware
  // because webhook data in the body of the request as raw JSON, not as JSON in the body of the request.
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};

// Here we only update the user's payment details, and confirm credits
// if payment mode === payment (e.g. one-time payment). If payment mode === subscription,
// we update its status in the customer.subscription.created or customer.subscription.updated webhook.
// NOTE: If you're accepting async payment methods like bank transfers or SEPA and not just card payments
// which are synchronous, checkout session completed could potentially result in a pending payment.
// If so, use the checkout.session.async_payment_succeeded event to confirm the payment.
async function handleCheckoutSessionCompleted(
  session: SessionCompletedData,
  prismaUserDelegate: PrismaClient['user']
) {
  const isSuccessfulOneTimePayment = session.mode === 'payment' && session.payment_status === 'paid';
  if (isSuccessfulOneTimePayment) {
    await saveSuccessfulOneTimePayment(session, prismaUserDelegate);
  }
}

async function saveSuccessfulOneTimePayment(
  session: SessionCompletedData,
  prismaUserDelegate: PrismaClient['user']
) {
  const userStripeId = session.customer;
  const lineItems = await getCheckoutLineItemsBySessionId(session.id);
  const lineItemPriceId = extractPriceId(lineItems);
  const planId = getPlanIdByPriceId(lineItemPriceId);
  const plan = paymentPlans[planId];
  const { numOfCreditsPurchased } = getPlanEffectPaymentDetails({ planId, planEffect: plan.effect });
  return updateUserStripePaymentDetails(
    { userStripeId, numOfCreditsPurchased, datePaid: new Date() },
    prismaUserDelegate
  );
}

// This is called when a subscription is successfully purchased or renewed and payment succeeds.
// Invoices are not created for one-time payments, so we handle them above.
async function handleInvoicePaid(invoice: InvoicePaidData, prismaUserDelegate: PrismaClient['user']) {
  await saveActiveSubscription(invoice, prismaUserDelegate);
}

async function saveActiveSubscription(invoice: InvoicePaidData, prismaUserDelegate: PrismaClient['user']) {
  const userStripeId = invoice.customer;
  const datePaid = new Date(invoice.period_start * 1000);
  const lineItems = await invoiceLineItemsSchema.parseAsync(invoice.lines);
  const priceId = extractPriceId(lineItems);
  const subscriptionPlan = getPlanIdByPriceId(priceId);
  return updateUserStripePaymentDetails(
    { userStripeId, datePaid, subscriptionPlan, subscriptionStatus: SubscriptionStatus.Active },
    prismaUserDelegate
  );
}

async function handleCustomerSubscriptionCreated(
  subscription: SubscriptionCreatedData,
  prismaUserDelegate: PrismaClient['user']
) {
  // We save everything except the subscription status (hence "unpaid"),
  // which we update in handleInvoicePaid once we get confirmation the payment succeeded.
  await saveUnpaidSubscription(subscription, prismaUserDelegate);
}

async function saveUnpaidSubscription(
  subscription: SubscriptionCreatedData,
  prismaUserDelegate: PrismaClient['user']
) {
  const userStripeId = subscription.customer;
  const priceId = extractPriceId(subscription.items);
  const subscriptionPlan = getPlanIdByPriceId(priceId);
  return updateUserStripePaymentDetails({ userStripeId, subscriptionPlan }, prismaUserDelegate);
}

async function handleCustomerSubscriptionUpdated(
  subscription: SubscriptionUpdatedData,
  prismaUserDelegate: PrismaClient['user']
) {
  const userStripeId = subscription.customer;
  let subscriptionStatus: SubscriptionStatus | undefined;
  const priceId = extractPriceId(subscription.items);
  const subscriptionPlan = getPlanIdByPriceId(priceId);

  // There are other subscription statuses, such as `trialing` that we are not handling and simply ignore
  // If you'd like to handle more statuses, you can add more cases above. Make sure to update the `SubscriptionStatus` type in `payment/plans.ts` as well.
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

async function handleCustomerSubscriptionDeleted(
  subscription: SubscriptionDeletedData,
  prismaUserDelegate: PrismaClient['user']
) {
  const userStripeId = subscription.customer;
  return updateUserStripePaymentDetails(
    { userStripeId, subscriptionStatus: SubscriptionStatus.Deleted },
    prismaUserDelegate
  );
}

type SubscsriptionItems = z.infer<typeof subscriptionItemsSchema>;

const subscriptionItemsSchema = z.object({
  data: z.array(
    z.object({
      price: z.object({
        id: z.string(),
      }),
    })
  ),
});

type InvoiceLineItems = z.infer<typeof invoiceLineItemsSchema>;

const invoiceLineItemsSchema = z.object({
  data: z.array(
    z.object({
      pricing: z.object({ price_details: z.object({ price: z.string() }) }),
    })
  ),
});

// We only expect one line item, but if you set up a product with multiple prices, you should change this function to handle them.
function extractPriceId(items: SubscsriptionItems | InvoiceLineItems): string {
  if (items.data.length === 0) {
    throw new HttpError(400, 'No items in stripe event object');
  }
  if (items.data.length > 1) {
    throw new HttpError(400, 'More than one item in stripe event object');
  }

  const firstItem = items.data[0];

  if ('price' in firstItem) {
    return firstItem.price.id;
  } else if ('pricing' in firstItem) {
    return firstItem.pricing.price_details.price;
  } else {
    throw new HttpError(500, 'Unable to extract price id due to unexpected item structure');
  }
}

async function getCheckoutLineItemsBySessionId(sessionId: string) {
  try {
    const { line_items: lineItemsRaw } = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    const lineItems = await subscriptionItemsSchema.parseAsync(lineItemsRaw);

    return lineItems;
  } catch (e: unknown) {
    throw new HttpError(500, 'Error parsing Stripe line items');
  }
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
