import { type MiddlewareConfigFn, HttpError } from 'wasp/server';
import { type PaymentsWebhook } from 'wasp/server/api';
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
import {
  InvoicePaidData,
  parseWebhookPayload,
  SessionCompletedData,
  SubscriptionDeletedData,
  SubscriptionUpdatedData,
} from './webhookPayload';
import { UnhandledWebhookEventError } from '../errors';

export const stripeWebhook: PaymentsWebhook = async (request, response, context) => {
  try {
    const secret = requireNodeEnvVar('STRIPE_WEBHOOK_SECRET');
    const sig = request.headers['stripe-signature'];
    if (!sig) {
      throw new HttpError(400, 'Stripe Webhook Signature Not Provided');
    }
    const rawStripeEvent = ensureStripeEvent(request, sig, secret);
    const payload = await parseWebhookPayload(rawStripeEvent).catch((e) => {
      if (e instanceof UnhandledWebhookEventError) {
        throw e;
      } else {
        console.error('Error parsing webhook payload', e);
        throw new HttpError(400, e.message);
      }
    });
    const prismaUserDelegate = context.entities.User;
    switch (payload.eventName) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(payload.data, prismaUserDelegate);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(payload.data, prismaUserDelegate);
        break;
      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(payload.data, prismaUserDelegate);
        break;
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(payload.data, prismaUserDelegate);
        break;
      default:
        // If you'd like to handle more events, you can add more cases above.
        // When deploying your app, you configure your webhook in the Stripe dashboard to only send the events that you're
        // handling above and that are necessary for the functioning of your app. See: https://docs.opensaas.sh/guides/deploying/#setting-up-your-stripe-webhook
        // In development, it is likely that you will receive other events that you are not handling, and that's fine. These can be ignored without any issues.
        assertUnreachable(payload);
    }
    return response.json({ received: true }); // Stripe expects a 200 response to acknowledge receipt of the webhook
  } catch (err) {
    if (err instanceof UnhandledWebhookEventError) {
      return response.status(200).json({ received: true });
    }

    console.error('Webhook error:', err);
    if (err instanceof HttpError) {
      return response.status(err.statusCode).json({ error: err.message });
    } else {
      return response.status(400).json({ error: 'Error Processing Lemon Squeezy Webhook Event' });
    }
  }
};

function ensureStripeEvent(request: express.Request, sig: string | string[], secret: string): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(request.body, sig, secret);
  } catch (err) {
    throw new HttpError(500, 'Error Constructing Stripe Webhook Event');
  }
}

export const stripeMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig) => {
  // We need to delete the default 'express.json' middleware and replace it with 'express.raw' middleware
  // because webhook data in the body of the request as raw JSON, not as JSON in the body of the request.
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};

export async function handleCheckoutSessionCompleted(
  session: SessionCompletedData,
  prismaUserDelegate: PrismaClient['user']
) {
  const userStripeId = session.customer;
  const lineItems = await getSubscriptionLineItemsBySessionId(session.id).catch((e) => {
    throw new HttpError(500, e.message);
  });

  const lineItemPriceId = extractPriceId(lineItems);

  const planId = getPlanIdByPriceId(lineItemPriceId);
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

export async function handleInvoicePaid(invoice: InvoicePaidData, prismaUserDelegate: PrismaClient['user']) {
  const userStripeId = validateUserStripeIdOrThrow(invoice.customer);
  const datePaid = new Date(invoice.period_start * 1000);
  return updateUserStripePaymentDetails({ userStripeId, datePaid }, prismaUserDelegate);
}

export async function handleCustomerSubscriptionUpdated(
  subscription: SubscriptionUpdatedData,
  prismaUserDelegate: PrismaClient['user']
) {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  let subscriptionStatus: SubscriptionStatus | undefined;

  const priceId = extractPriceId(subscription.items);
  const subscriptionPlan = getPlanIdByPriceId(priceId);

  // There are other subscription statuses, such as `trialing` that we are not handling and simply ignore
  // If you'd like to handle more statuses, you can add more cases above. Make sure to update the `SubscriptionStatus` type in `payment/plans.ts` as well
  if (subscription.status === 'active') {
    subscriptionStatus = subscription.cancel_at_period_end ? 'cancel_at_period_end' : 'active';
  } else if (subscription.status === 'past_due') {
    subscriptionStatus = 'past_due';
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
  subscription: SubscriptionDeletedData,
  prismaUserDelegate: PrismaClient['user']
) {
  const userStripeId = validateUserStripeIdOrThrow(subscription.customer);
  return updateUserStripePaymentDetails({ userStripeId, subscriptionStatus: 'deleted' }, prismaUserDelegate);
}

function validateUserStripeIdOrThrow(userStripeId: Stripe.Checkout.Session['customer']): string {
  if (!userStripeId) throw new HttpError(400, 'No customer id');
  if (typeof userStripeId !== 'string') throw new HttpError(400, 'Customer id is not a string');
  return userStripeId;
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

function extractPriceId(items: SubscsriptionItems): string {
  if (items.data.length > 1) {
    throw new HttpError(400, 'More than one item in stripe event object');
  }
  return items.data[0].price.id;
}

async function getSubscriptionLineItemsBySessionId(sessionId: string) {
  const { line_items: lineItemsRaw } = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  });

  const lineItems = await subscriptionItemsSchema.parseAsync(lineItemsRaw).catch((e) => {
    console.error(e);
    throw new Error('Error parsing Stripe line items');
  });

  return lineItems;
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
