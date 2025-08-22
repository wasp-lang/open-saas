// @ts-ignore
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import express from 'express';
import type { MiddlewareConfigFn } from 'wasp/server';
import type { PaymentsWebhook } from 'wasp/server/api';
import { SubscriptionStatus as OpenSaasSubscriptionStatus, PaymentPlanId, paymentPlans } from '../plans';
import { updateUserPolarPaymentDetails } from './paymentDetails';
import { MiddlewareConfig } from 'wasp/server/middleware';
import { requireNodeEnvVar } from '../../server/utils';
import {
  parseWebhookPayload,
  type OrderData,
  type SubscriptionData,
  type PolarWebhookPayload,
} from './webhookPayload';
import { UnhandledWebhookEventError } from '../errors';
import { assertUnreachable } from '../../shared/utils';

export const polarWebhook: PaymentsWebhook = async (req, res, context) => {
  try {
    const rawEvent = constructPolarEvent(req);
    const { eventName, data } = await parseWebhookPayload(rawEvent);
    const prismaUserDelegate = context.entities.User;

    switch (eventName) {
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
  const secret = requireNodeEnvVar('POLAR_WEBHOOK_SECRET');

  return validateEvent(request.body, request.headers as Record<string, string>, secret);
}

async function handleOrderCompleted(data: OrderData, userDelegate: any): Promise<void> {
  const customerId = data.customer.id;
  const waspUserId = data.customer.externalId;

  if (!waspUserId) {
    console.warn('Order completed without customer.externalId (Wasp user ID)');
    return;
  }

  console.log(`Order completed: ${data.id} for customer: ${customerId}`);

  await updateUserPolarPaymentDetails(
    {
      waspUserId,
      polarCustomerId: customerId,
      datePaid: data.createdAt,
    },
    userDelegate
  );
}

async function handleSubscriptionCreated(data: SubscriptionData, userDelegate: any): Promise<void> {
  const customerId = data.customer.id;
  const productId = data.productId;
  const status = data.status;
  const waspUserId = data.customer.externalId;

  if (!waspUserId || !productId) {
    console.warn('Subscription created without required customer.externalId (Wasp user ID) or plan_id');
    return;
  }

  const planId = getPlanIdByProductId(productId);
  const subscriptionStatus = getSubscriptionStatus(status);

  await updateUserPolarPaymentDetails(
    {
      waspUserId,
      polarCustomerId: customerId,
      subscriptionPlan: planId,
      subscriptionStatus,
      datePaid: data.createdAt,
    },
    userDelegate
  );

  console.log(
    `Subscription created: ${data.id}, customer: ${customerId}, plan: ${planId}, status: ${subscriptionStatus}`
  );
}

async function handleSubscriptionUpdated(data: SubscriptionData, userDelegate: any): Promise<void> {
  const customerId = data.customer.id;
  const status = data.status;
  const productId = data.productId;
  const waspUserId = data.customer.externalId;

  if (!waspUserId) {
    console.warn('Subscription updated without customer.externalId (Wasp user ID)');
    return;
  }

  const subscriptionStatus = getSubscriptionStatus(status);
  const planId = productId ? getPlanIdByProductId(productId) : undefined;

  await updateUserPolarPaymentDetails(
    {
      waspUserId,
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
  const customerId = data.customer.id;
  const waspUserId = data.customer.externalId;

  if (!waspUserId) {
    console.warn('Subscription canceled without customer.externalId (Wasp user ID)');
    return;
  }

  await updateUserPolarPaymentDetails(
    {
      waspUserId,
      polarCustomerId: customerId,
      subscriptionStatus: OpenSaasSubscriptionStatus.CancelAtPeriodEnd,
    },
    userDelegate
  );

  console.log(`Subscription canceled: ${data.id}, customer: ${customerId}`);
}

async function handleSubscriptionActivated(data: SubscriptionData, userDelegate: any): Promise<void> {
  const customerId = data.customer.id;
  const productId = data.productId;
  const waspUserId = data.customer.externalId;

  if (!waspUserId) {
    console.warn('Subscription activated without customer.externalId (Wasp user ID)');
    return;
  }

  const planId = productId ? getPlanIdByProductId(productId) : undefined;

  await updateUserPolarPaymentDetails(
    {
      waspUserId,
      polarCustomerId: customerId,
      subscriptionPlan: planId,
      subscriptionStatus: OpenSaasSubscriptionStatus.Active,
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
    console.warn(`Order ${order.id} product ${productId} is not a credit product (plan: ${planId})`);
    return 0;
  }

  return plan.effect.amount;
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
