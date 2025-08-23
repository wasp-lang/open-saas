// @ts-ignore
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import express from 'express';
import type { MiddlewareConfigFn } from 'wasp/server';
import type { PaymentsWebhook } from 'wasp/server/api';
import { MiddlewareConfig } from 'wasp/server/middleware';
import { requireNodeEnvVar } from '../../server/utils';
import { assertUnreachable } from '../../shared/utils';
import { UnhandledWebhookEventError } from '../errors';
import { SubscriptionStatus as OpenSaasSubscriptionStatus, PaymentPlanId, paymentPlans } from '../plans';
import { updateUserPolarPaymentDetails } from './userPaymentDetails';
import {
  parseWebhookPayload,
  type OrderData,
  type PolarWebhookPayload,
  type SubscriptionData,
} from './webhookPayload';

export const polarWebhook: PaymentsWebhook = async (req, res, context) => {
  try {
    const rawEvent = constructPolarEvent(req);
    const { eventName, data } = await parseWebhookPayload(rawEvent);
    const prismaUserDelegate = context.entities.User;

    switch (eventName) {
      case 'order.paid':
        await handleOrderCompleted(data, prismaUserDelegate);

        break;
      case 'subscription.revoked':
        await handleSubscriptionRevoked(data, prismaUserDelegate);

        break;
      case 'subscription.uncanceled':
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
  const metadata = data.metadata || {};
  const paymentMode = metadata?.paymentMode;

  if (!waspUserId) {
    console.warn('Order completed without customer.externalId (Wasp user ID)');
    return;
  }

  if (paymentMode !== 'payment') {
    console.log(`Order ${data.id} is not for credits (mode: ${paymentMode})`);
    return;
  }

  const creditsAmount = extractCreditsFromPolarOrder(data);

  console.log(`Order completed: ${data.id} for customer: ${customerId}`);

  await updateUserPolarPaymentDetails(
    {
      waspUserId,
      polarCustomerId: customerId,
      numOfCreditsPurchased: creditsAmount,
      datePaid: data.createdAt,
    },
    userDelegate
  );
}

async function handleSubscriptionRevoked(data: SubscriptionData, userDelegate: any): Promise<void> {
  const customerId = data.customer.id;
  const waspUserId = data.customer.externalId;

  if (!waspUserId) {
    console.warn('Subscription revoked without required customer.externalId (Wasp user ID)');
    return;
  }

  await updateUserPolarPaymentDetails(
    {
      waspUserId,
      polarCustomerId: customerId,
      subscriptionStatus: OpenSaasSubscriptionStatus.Deleted,
    },
    userDelegate
  );

  console.log(`Subscription revoked: ${data.id}, customer: ${customerId}`);
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
    throw new Error(`No product ID found in order: ${order.id}`);
  }

  const planId = getPlanIdByProductId(productId);
  const plan = paymentPlans[planId];

  if (!plan) {
    throw new Error(`Unknown plan ID: ${planId}`);
  }

  if (plan.effect.kind !== 'credits') {
    throw new Error(`Order ${order.id} product ${productId} is not a credit product (plan: ${planId})`);
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
