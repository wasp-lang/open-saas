import { type MiddlewareConfigFn, HttpError } from 'wasp/server';
import { type PaymentsWebhook } from 'wasp/server/api';
import { type PrismaClient } from '@prisma/client';
import express from 'express';
import { paymentPlans, PaymentPlanId, SubscriptionStatus } from '../plans';
import { updateUserLemonSqueezyPaymentDetails } from './paymentDetails';
import { type Order, type Subscription, getCustomer } from '@lemonsqueezy/lemonsqueezy.js';
import crypto from 'crypto';
import { requireNodeEnvVar } from '../../server/utils';

export const lemonSqueezyWebhook: PaymentsWebhook = async (request, response, context) => {
  try {
    const rawBody = request.body.toString('utf8');
    const signature = request.get('X-Signature');
    if (!signature) {
      throw new HttpError(400, 'Lemon Squeezy Webhook Signature Not Provided');
    }

    const secret = requireNodeEnvVar('LEMONSQUEEZY_WEBHOOK_SECRET');
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');

    if (!crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), digest)) {
      throw new HttpError(400, 'Invalid signature');
    }

    const event = JSON.parse(rawBody);
    const userId = event.meta.custom_data.user_id;
    const prismaUserDelegate = context.entities.User;
    switch (event.meta.event_name) {
      case 'order_created':
        await handleOrderCreated(event as Order, userId, prismaUserDelegate);
        break;
      case 'subscription_created':
        await handleSubscriptionCreated(event as Subscription, userId, prismaUserDelegate);
        break;
      case 'subscription_updated':
        await handleSubscriptionUpdated(event as Subscription, userId, prismaUserDelegate);
        break;
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event as Subscription, userId, prismaUserDelegate);
        break;
      case 'subscription_expired':
        await handleSubscriptionExpired(event as Subscription, userId, prismaUserDelegate);
        break;
      default:
        console.error('Unhandled event type: ', event.meta.event_name);
    }

    response.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    if (err instanceof HttpError) {
      response.status(err.statusCode).json({ error: err.message });
    } else {
      response.status(400).json({ error: 'Error Processing Lemon Squeezy Webhook Event' });
    }
  }
};

export const lemonSqueezyMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig) => {
  // We need to delete the default 'express.json' middleware and replace it with 'express.raw' middleware
  // because webhook data in the body of the request as raw JSON, not as JSON in the body of the request.
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};

// This will fire for one-time payment orders AND subscriptions. But subscriptions will ALSO send a follow-up
// event of 'subscription_created'. So we use this handler mainly to process one-time, credit-based orders,
// as well as to save the customer portal URL and customer id for the user.
async function handleOrderCreated(data: Order, userId: string, prismaUserDelegate: PrismaClient['user']) {
  const { customer_id, status, first_order_item, order_number } = data.data.attributes;
  const lemonSqueezyId = customer_id.toString();

  const planId = getPlanIdByVariantId(first_order_item.variant_id.toString());
  const plan = paymentPlans[planId];

  const lemonSqueezyCustomerPortalUrl = await fetchUserCustomerPortalUrl({ lemonSqueezyId });

  let numOfCreditsPurchased: number | undefined = undefined;
  let datePaid: Date | undefined = undefined;
  if (status === 'paid' && plan.effect.kind === 'credits') {
    numOfCreditsPurchased = plan.effect.amount;
    datePaid = new Date();
  }

  await updateUserLemonSqueezyPaymentDetails(
    { lemonSqueezyId, userId, lemonSqueezyCustomerPortalUrl, numOfCreditsPurchased, datePaid },
    prismaUserDelegate
  );

  console.log(`Order ${order_number} created for user ${lemonSqueezyId}`);
}

async function handleSubscriptionCreated(
  data: Subscription,
  userId: string,
  prismaUserDelegate: PrismaClient['user']
) {
  const { customer_id, status, variant_id } = data.data.attributes;
  const lemonSqueezyId = customer_id.toString();

  const planId = getPlanIdByVariantId(variant_id.toString());

  if (status === 'active') {
    await updateUserLemonSqueezyPaymentDetails(
      {
        lemonSqueezyId,
        userId,
        subscriptionPlan: planId,
        subscriptionStatus: status as SubscriptionStatus,
        datePaid: new Date(),
      },
      prismaUserDelegate
    );
  } else {
    console.warn(`Unexpected status '${status}' for newly created subscription`);
  }

  console.log(`Subscription created for user ${lemonSqueezyId}`);
}

// NOTE: LemonSqueezy's 'subscription_updated' event is sent as a catch-all and fires even after 'subscription_created' & 'order_created'.
async function handleSubscriptionUpdated(
  data: Subscription,
  userId: string,
  prismaUserDelegate: PrismaClient['user']
) {
  const { customer_id, status, variant_id } = data.data.attributes;
  const lemonSqueezyId = customer_id.toString();

  const planId = getPlanIdByVariantId(variant_id.toString());

  // We ignore other statuses like 'paused' and 'unpaid' for now, because we block user usage if their status is NOT active.
  // Note that a status changes to 'past_due' on a failed payment retry, then after 4 unsuccesful payment retries status
  // becomes 'unpaid' and finally 'expired' (i.e. 'deleted').
  // NOTE: ability to pause or trial a subscription is something that has to be additionally configured in the lemon squeezy dashboard.
  // If you do enable these features, make sure to handle these statuses here.
  if (status === 'past_due' || status === 'active') {
    await updateUserLemonSqueezyPaymentDetails(
      {
        lemonSqueezyId,
        userId,
        subscriptionPlan: planId,
        subscriptionStatus: status as SubscriptionStatus,
        ...(status === 'active' && { datePaid: new Date() }),
      },
      prismaUserDelegate
    );
    console.log(`Subscription updated for user ${lemonSqueezyId}`);
  }
}

async function handleSubscriptionCancelled(
  data: Subscription,
  userId: string,
  prismaUserDelegate: PrismaClient['user']
) {
  const { customer_id } = data.data.attributes;
  const lemonSqueezyId = customer_id.toString();

  await updateUserLemonSqueezyPaymentDetails(
    {
      lemonSqueezyId,
      userId,
      // cancel_at_period_end is the Stripe equivalent of LemonSqueezy's cancelled
      subscriptionStatus: 'cancel_at_period_end' as SubscriptionStatus,
    },
    prismaUserDelegate
  );

  console.log(`Subscription cancelled for user ${lemonSqueezyId}`);
}

async function handleSubscriptionExpired(
  data: Subscription,
  userId: string,
  prismaUserDelegate: PrismaClient['user']
) {
  const { customer_id } = data.data.attributes;
  const lemonSqueezyId = customer_id.toString();

  await updateUserLemonSqueezyPaymentDetails(
    {
      lemonSqueezyId,
      userId,
      // deleted is the Stripe equivalent of LemonSqueezy's expired
      subscriptionStatus: SubscriptionStatus.Deleted,
    },
    prismaUserDelegate
  );

  console.log(`Subscription expired for user ${lemonSqueezyId}`);
}

async function fetchUserCustomerPortalUrl({ lemonSqueezyId }: { lemonSqueezyId: string }): Promise<string> {
  const { data: lemonSqueezyCustomer, error } = await getCustomer(lemonSqueezyId);
  if (error) {
    throw new Error(
      `Error fetching customer portal URL for user lemonsqueezy id ${lemonSqueezyId}: ${error}`
    );
  }
  const customerPortalUrl = lemonSqueezyCustomer.data.attributes.urls.customer_portal;
  if (!customerPortalUrl) {
    throw new Error(`No customer portal URL found for user lemonsqueezy id ${lemonSqueezyId}`);
  }
  return customerPortalUrl;
}

function getPlanIdByVariantId(variantId: string): PaymentPlanId {
  const planId = Object.values(PaymentPlanId).find(
    (planId) => paymentPlans[planId].getPaymentProcessorPlanId() === variantId
  );
  if (!planId) {
    throw new Error(`No plan with LemonSqueezy variant id ${variantId}`);
  }
  return planId;
}

