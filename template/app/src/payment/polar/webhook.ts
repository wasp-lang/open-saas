// @ts-ignore
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import express from 'express';
import type { MiddlewareConfigFn } from 'wasp/server';
import type { PaymentsWebhook } from 'wasp/server/api';
import { SubscriptionStatus as OpenSaasSubscriptionStatus, PaymentPlanId, paymentPlans } from '../plans';
import { findUserByPolarCustomerId, updateUserPolarPaymentDetails } from './paymentDetails';
import { PolarWebhookPayload } from './types';
// @ts-ignore
import { SubscriptionStatus as PolarSubscriptionStatus } from '@polar-sh/sdk/models/components/subscriptionstatus.js';
// @ts-ignore
import { Order } from '@polar-sh/sdk/models/components/order.js';
// @ts-ignore
import { Subscription } from '@polar-sh/sdk/models/components/subscription.js';
import { MiddlewareConfig } from 'wasp/server/middleware';
import { requireNodeEnvVar } from '../../server/utils';

/**
 * Main Polar webhook handler with signature verification and proper event routing
 * Handles all Polar webhook events with comprehensive error handling and logging
 * @param req Express request object containing raw webhook payload
 * @param res Express response object for webhook acknowledgment
 * @param context Wasp context containing database entities and user information
 */
export const polarWebhook: PaymentsWebhook = async (req, res, context) => {
  try {
    const secret = requireNodeEnvVar('POLAR_WEBHOOK_SECRET');
    const event = validateEvent(req.body, req.headers as Record<string, string>, secret);
    const success = await handlePolarEvent(event, context);

    if (success) {
      res.status(200).json({ received: true });
    } else {
      res.status(422).json({ received: true, processed: false });
    }
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error('Polar webhook signature verification failed:', error);
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }

    console.error('Polar webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Routes Polar webhook events to appropriate handlers
 * @param event Verified Polar webhook event
 * @param context Wasp context with database entities
 * @returns Promise resolving to boolean indicating if event was handled
 */
async function handlePolarEvent(event: PolarWebhookPayload, context: any): Promise<boolean> {
  const userDelegate = context.entities.User;

  try {
    switch (event.type) {
      case 'order.created':
        await handleOrderCreated(event.data, userDelegate);
        return true;

      case 'order.paid':
        await handleOrderCompleted(event.data, userDelegate);
        return true;

      case 'subscription.created':
        await handleSubscriptionCreated(event.data, userDelegate);
        return true;

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data, userDelegate);
        return true;

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data, userDelegate);
        return true;

      case 'subscription.active':
        await handleSubscriptionActivated(event.data, userDelegate);
        return true;

      default:
        console.warn('Unhandled Polar webhook event type:', event.type);
        return false;
    }
  } catch (error) {
    console.error(`Error handling Polar event ${event.type}:`, error);
    throw error; // Re-throw to trigger 500 response for retry
  }
}

/**
 * Handle order creation events (one-time payments/credits)
 * @param data Order data from webhook
 * @param userDelegate Prisma user delegate
 */
async function handleOrderCreated(data: Order, userDelegate: any): Promise<void> {
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

/**
 * Handle order completion events
 * @param data Order data from webhook
 * @param userDelegate Prisma user delegate
 */
async function handleOrderCompleted(data: Order, userDelegate: any): Promise<void> {
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

/**
 * Handle subscription creation events
 * @param data Subscription data from webhook
 * @param userDelegate Prisma user delegate
 */
async function handleSubscriptionCreated(data: Subscription, userDelegate: any): Promise<void> {
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

/**
 * Handle subscription update events
 * @param data Subscription data from webhook
 * @param userDelegate Prisma user delegate
 */
async function handleSubscriptionUpdated(data: Subscription, userDelegate: any): Promise<void> {
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

/**
 * Handle subscription cancellation events
 * @param data Subscription data from webhook
 * @param userDelegate Prisma user delegate
 */
async function handleSubscriptionCanceled(data: Subscription, userDelegate: any): Promise<void> {
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

/**
 * Handle subscription activation events
 * @param data Subscription data from webhook
 * @param userDelegate Prisma user delegate
 */
async function handleSubscriptionActivated(data: Subscription, userDelegate: any): Promise<void> {
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

/**
 * Maps Polar subscription status to OpenSaaS subscription status
 * Uses the comprehensive type system for better type safety and consistency
 * @param polarStatus The status from Polar webhook payload
 * @returns The corresponding OpenSaaS status
 */
function getSubscriptionStatus(polarStatus: PolarSubscriptionStatus): OpenSaasSubscriptionStatus {
  const statusMap: Record<PolarSubscriptionStatus, OpenSaasSubscriptionStatus> = {
    [PolarSubscriptionStatus.Active]: OpenSaasSubscriptionStatus.Active,
    [PolarSubscriptionStatus.Canceled]: OpenSaasSubscriptionStatus.CancelAtPeriodEnd,
    [PolarSubscriptionStatus.PastDue]: OpenSaasSubscriptionStatus.PastDue,
    [PolarSubscriptionStatus.IncompleteExpired]: OpenSaasSubscriptionStatus.Deleted,
    [PolarSubscriptionStatus.Incomplete]: OpenSaasSubscriptionStatus.PastDue,
    [PolarSubscriptionStatus.Trialing]: OpenSaasSubscriptionStatus.Active,
    [PolarSubscriptionStatus.Unpaid]: OpenSaasSubscriptionStatus.PastDue,
  };

  return statusMap[polarStatus];
}

/**
 * Helper function to extract credits amount from order
 * @param order Order data from Polar webhook payload
 * @returns Number of credits purchased
 */
function extractCreditsFromPolarOrder(order: Order): number {
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

/**
 * Middleware configuration function for Polar webhooks
 * Sets up raw body parsing for webhook signature verification
 * @param middlewareConfig Express middleware configuration object
 * @returns Updated middleware configuration
 */
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
