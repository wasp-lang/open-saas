// @ts-ignore
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import express from 'express';
import type { MiddlewareConfigFn } from 'wasp/server';
import type { PaymentsWebhook } from 'wasp/server/api';
import { SubscriptionStatus as OpenSaasSubscriptionStatus, PaymentPlanId, paymentPlans } from '../plans';
import { findUserByPolarCustomerId, updateUserPolarPaymentDetails } from './paymentDetails';
// @ts-ignore
import { SubscriptionStatus as PolarSubscriptionStatus } from '@polar-sh/sdk/models/components/subscriptionstatus.js';
// @ts-ignore
import { Order } from '@polar-sh/sdk/models/components/order.js';
// @ts-ignore
import { Subscription } from '@polar-sh/sdk/models/components/subscription.js';
// @ts-ignore
import { WebhookBenefitCreatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitcreatedpayload.js';
// @ts-ignore
import { WebhookBenefitGrantCreatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantcreatedpayload.js';
// @ts-ignore
import { WebhookBenefitGrantCycledPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantcycledpayload.js';
// @ts-ignore
import { WebhookBenefitGrantRevokedPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantrevokedpayload.js';
// @ts-ignore
import { WebhookBenefitGrantUpdatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantupdatedpayload.js';
// @ts-ignore
import { WebhookBenefitUpdatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitupdatedpayload.js';
// @ts-ignore
import { WebhookCheckoutCreatedPayload } from '@polar-sh/sdk/models/components/webhookcheckoutcreatedpayload.js';
// @ts-ignore
import { WebhookCheckoutUpdatedPayload } from '@polar-sh/sdk/models/components/webhookcheckoutupdatedpayload.js';
// @ts-ignore
import { WebhookCustomerCreatedPayload } from '@polar-sh/sdk/models/components/webhookcustomercreatedpayload.js';
// @ts-ignore
import { WebhookCustomerDeletedPayload } from '@polar-sh/sdk/models/components/webhookcustomerdeletedpayload.js';
// @ts-ignore
import { WebhookCustomerStateChangedPayload } from '@polar-sh/sdk/models/components/webhookcustomerstatechangedpayload.js';
// @ts-ignore
import { WebhookCustomerUpdatedPayload } from '@polar-sh/sdk/models/components/webhookcustomerupdatedpayload.js';
// @ts-ignore
import { WebhookOrderCreatedPayload } from '@polar-sh/sdk/models/components/webhookordercreatedpayload.js';
// @ts-ignore
import { WebhookOrderPaidPayload } from '@polar-sh/sdk/models/components/webhookorderpaidpayload.js';
// @ts-ignore
import { WebhookOrderRefundedPayload } from '@polar-sh/sdk/models/components/webhookorderrefundedpayload.js';
// @ts-ignore
import { WebhookOrderUpdatedPayload } from '@polar-sh/sdk/models/components/webhookorderupdatedpayload.js';
// @ts-ignore
import { WebhookOrganizationUpdatedPayload } from '@polar-sh/sdk/models/components/webhookorganizationupdatedpayload.js';
// @ts-ignore
import { WebhookProductCreatedPayload } from '@polar-sh/sdk/models/components/webhookproductcreatedpayload.js';
// @ts-ignore
import { WebhookProductUpdatedPayload } from '@polar-sh/sdk/models/components/webhookproductupdatedpayload.js';
// @ts-ignore
import { WebhookRefundCreatedPayload } from '@polar-sh/sdk/models/components/webhookrefundcreatedpayload.js';
// @ts-ignore
import { WebhookRefundUpdatedPayload } from '@polar-sh/sdk/models/components/webhookrefundupdatedpayload.js';
// @ts-ignore
import { WebhookSubscriptionActivePayload } from '@polar-sh/sdk/models/components/webhooksubscriptionactivepayload.js';
// @ts-ignore
import { WebhookSubscriptionCanceledPayload } from '@polar-sh/sdk/models/components/webhooksubscriptioncanceledpayload.js';
// @ts-ignore
import { WebhookSubscriptionCreatedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload.js';
// @ts-ignore
import { WebhookSubscriptionRevokedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionrevokedpayload.js';
// @ts-ignore
import { WebhookSubscriptionUncanceledPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionuncanceledpayload.js';
// @ts-ignore
import { WebhookSubscriptionUpdatedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload.js';
import { MiddlewareConfig } from 'wasp/server/middleware';
import { requireNodeEnvVar } from '../../server/utils';

type PolarWebhookPayload =
  | WebhookCheckoutCreatedPayload
  | WebhookBenefitCreatedPayload
  | WebhookBenefitGrantCreatedPayload
  | WebhookBenefitGrantRevokedPayload
  | WebhookBenefitGrantUpdatedPayload
  | WebhookBenefitGrantCycledPayload
  | WebhookBenefitUpdatedPayload
  | WebhookCheckoutUpdatedPayload
  | WebhookOrderCreatedPayload
  | WebhookOrderRefundedPayload
  | WebhookOrderUpdatedPayload
  | WebhookOrderPaidPayload
  | WebhookOrganizationUpdatedPayload
  | WebhookProductCreatedPayload
  | WebhookProductUpdatedPayload
  | WebhookRefundCreatedPayload
  | WebhookRefundUpdatedPayload
  | WebhookSubscriptionActivePayload
  | WebhookSubscriptionCanceledPayload
  | WebhookSubscriptionCreatedPayload
  | WebhookSubscriptionRevokedPayload
  | WebhookSubscriptionUncanceledPayload
  | WebhookSubscriptionUpdatedPayload
  | WebhookCustomerCreatedPayload
  | WebhookCustomerUpdatedPayload
  | WebhookCustomerDeletedPayload
  | WebhookCustomerStateChangedPayload;

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
