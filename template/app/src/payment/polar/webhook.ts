// @ts-ignore
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import express from 'express';
import type { MiddlewareConfigFn } from 'wasp/server';
import type { PaymentsWebhook } from 'wasp/server/api';
import { SubscriptionStatus as OpenSaasSubscriptionStatus, PaymentPlanId, paymentPlans } from '../plans';
import { findUserByPolarCustomerId, updateUserPolarPaymentDetails } from './paymentDetails';
import { MiddlewareConfig } from 'wasp/server/middleware';
import { requireNodeEnvVar } from '../../server/utils';
import {
  parseWebhookPayload,
  type OrderData,
  type SubscriptionData,
  type PolarWebhookPayload,
  type ParsedWebhookPayload,
} from './webhookPayload';
import { UnhandledWebhookEventError } from '../errors';
import { assertUnreachable } from '../../shared/utils';

export const polarWebhook: PaymentsWebhook = async (req, res, context) => {
  try {
    const rawEvent = constructPolarEvent(req);
    const { eventName, data } = await parseWebhookPayload(rawEvent);
    const prismaUserDelegate = context.entities.User;

    switch (eventName) {
      case 'order.created':
        await handleOrderCreated(data, prismaUserDelegate);

        break;
      case 'order.paid':
        await handleOrderCompleted(data, prismaUserDelegate);

        break;
      case 'subscription.created':
        await handleSubscriptionCreated(data, prismaUserDelegate);

        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(data, prismaUserDelegate);

        break;
      case 'subscription.canceled':
        await handleSubscriptionCanceled(data, prismaUserDelegate);

        break;
      case 'subscription.active':
        await handleSubscriptionActivated(data, prismaUserDelegate);

        break;
      default:
        assertUnreachable(eventName);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    if (err instanceof UnhandledWebhookEventError) {
      console.error(err.message);
      return res.status(422).json({ error: err.message });
    }

    console.error('Webhook error:', err);
    if (err instanceof WebhookVerificationError) {
      return res.status(400).json({ error: 'Invalid signature' });
    } else {
      return res.status(500).json({ error: 'Error processing Polar webhook event' });
    }
  }
};

function constructPolarEvent(request: express.Request): PolarWebhookPayload {
  try {
    const secret = requireNodeEnvVar('POLAR_WEBHOOK_SECRET');
    return validateEvent(request.body, request.headers as Record<string, string>, secret);
  } catch (err) {
    throw new WebhookVerificationError('Error constructing Polar webhook event');
  }
}

async function handleOrderCreated(data: OrderData, userDelegate: any): Promise<void> {
  const customerId = data.customerId;
  const metadata = data.metadata || {};
  const paymentMode = metadata.paymentMode;

  if (!customerId) {
    console.warn('Order created without customer_id');
    return;
  }

  if (paymentMode !== 'payment') {
    console.log(`Order ${data.id} is not for credits (mode: ${paymentMode})`);
    return;
  }

  const creditsAmount = extractCreditsFromPolarOrder(data);

  await updateUserPolarPaymentDetails(
    {
      polarCustomerId: customerId,
      numOfCreditsPurchased: creditsAmount,
      datePaid: new Date(data.createdAt),
    },
    userDelegate
  );

  console.log(`Order created: ${data.id}, customer: ${customerId}, credits: ${creditsAmount}`);
}

async function handleOrderCompleted(data: OrderData, userDelegate: any): Promise<void> {
  const customerId = data.customerId;

  if (!customerId) {
    console.warn('Order completed without customer_id');
    return;
  }

  console.log(`Order completed: ${data.id} for customer: ${customerId}`);

  const user = await findUserByPolarCustomerId(customerId, userDelegate);
  if (user) {
    await updateUserPolarPaymentDetails(
      {
        polarCustomerId: customerId,
        datePaid: new Date(data.createdAt),
      },
      userDelegate
    );
  }
}

async function handleSubscriptionCreated(data: SubscriptionData, userDelegate: any): Promise<void> {
  const customerId = data.customerId;
  const productId = data.productId;
  const status = data.status;

  if (!customerId || !productId) {
    console.warn('Subscription created without required customer_id or plan_id');
    return;
  }

  const planId = getPlanIdByProductId(productId);
  const subscriptionStatus = getSubscriptionStatus(status);

  await updateUserPolarPaymentDetails(
    {
      polarCustomerId: customerId,
      subscriptionPlan: planId,
      subscriptionStatus,
      datePaid: new Date(data.createdAt),
    },
    userDelegate
  );

  console.log(
    `Subscription created: ${data.id}, customer: ${customerId}, plan: ${planId}, status: ${subscriptionStatus}`
  );
}

async function handleSubscriptionUpdated(data: SubscriptionData, userDelegate: any): Promise<void> {
  const customerId = data.customerId;
  const status = data.status;
  const productId = data.productId;

  if (!customerId) {
    console.warn('Subscription updated without customer_id');
    return;
  }

  const subscriptionStatus = getSubscriptionStatus(status);
  const planId = productId ? getPlanIdByProductId(productId) : undefined;

  await updateUserPolarPaymentDetails(
    {
      polarCustomerId: customerId,
      subscriptionPlan: planId,
      subscriptionStatus,
      ...(status === 'active' && { datePaid: new Date() }),
    },
    userDelegate
  );

  console.log(`Subscription updated: ${data.id}, customer: ${customerId}, status: ${subscriptionStatus}`);
}

async function handleSubscriptionCanceled(data: SubscriptionData, userDelegate: any): Promise<void> {
  const customerId = data.customerId;

  if (!customerId) {
    console.warn('Subscription canceled without customer_id');
    return;
  }

  await updateUserPolarPaymentDetails(
    {
      polarCustomerId: customerId,
      subscriptionStatus: 'cancelled',
    },
    userDelegate
  );

  console.log(`Subscription canceled: ${data.id}, customer: ${customerId}`);
}

async function handleSubscriptionActivated(data: SubscriptionData, userDelegate: any): Promise<void> {
  const customerId = data.customerId;
  const productId = data.productId;

  if (!customerId) {
    console.warn('Subscription activated without customer_id');
    return;
  }

  const planId = productId ? getPlanIdByProductId(productId) : undefined;

  await updateUserPolarPaymentDetails(
    {
      polarCustomerId: customerId,
      subscriptionPlan: planId,
      subscriptionStatus: 'active',
      datePaid: new Date(),
    },
    userDelegate
  );

  console.log(`Subscription activated: ${data.id}, customer: ${customerId}, plan: ${planId}`);
}

function getSubscriptionStatus(polarStatus: string): OpenSaasSubscriptionStatus {
  const statusMap: Record<string, OpenSaasSubscriptionStatus> = {
    active: OpenSaasSubscriptionStatus.Active,
    canceled: OpenSaasSubscriptionStatus.CancelAtPeriodEnd,
    past_due: OpenSaasSubscriptionStatus.PastDue,
    incomplete_expired: OpenSaasSubscriptionStatus.Deleted,
    incomplete: OpenSaasSubscriptionStatus.PastDue,
    trialing: OpenSaasSubscriptionStatus.Active,
    unpaid: OpenSaasSubscriptionStatus.PastDue,
  };

  return statusMap[polarStatus] || OpenSaasSubscriptionStatus.PastDue;
}

function extractCreditsFromPolarOrder(order: OrderData): number {
  const productId = order.productId;

  if (!productId) {
    console.warn('No product_id found in Polar order:', order.id);
    return 0;
  }

  let planId: PaymentPlanId;
  try {
    planId = getPlanIdByProductId(productId);
  } catch (error) {
    console.warn(`Unknown Polar product ID ${productId} in order ${order.id}`);
    return 0;
  }

  const plan = paymentPlans[planId];
  if (!plan) {
    console.warn(`No payment plan found for plan ID ${planId}`);
    return 0;
  }

  if (plan.effect.kind !== 'credits') {
    console.log(`Order ${order.id} product ${productId} is not a credit product (plan: ${planId})`);
    return 0;
  }

  const credits = plan.effect.amount;
  console.log(`Extracted ${credits} credits from order ${order.id} (product: ${productId})`);
  return credits;
}

function getPlanIdByProductId(polarProductId: string): PaymentPlanId {
  for (const [planId, plan] of Object.entries(paymentPlans)) {
    if (plan.getPaymentProcessorPlanId() === polarProductId) {
      return planId as PaymentPlanId;
    }
  }

  throw new Error(`Unknown Polar product ID: ${polarProductId}`);
}

export const polarMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig: MiddlewareConfig) => {
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));

  return middlewareConfig;
};
