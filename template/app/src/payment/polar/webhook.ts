// @ts-ignore
import { Order } from '@polar-sh/sdk/models/components/order.js';
// @ts-ignore
import { Subscription } from '@polar-sh/sdk/models/components/subscription.js';
// @ts-ignore
import { SubscriptionStatus } from '@polar-sh/sdk/models/components/subscriptionstatus.js';
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
// @ts-ignore
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import express from 'express';
import type { MiddlewareConfigFn, PrismaClient } from 'wasp/server';
import type { PaymentsWebhook } from 'wasp/server/api';
import { MiddlewareConfig } from 'wasp/server/middleware';
import { requireNodeEnvVar } from '../../server/utils';
import { UnhandledWebhookEventError } from '../errors';
import { SubscriptionStatus as OpenSaasSubscriptionStatus, PaymentPlanId, paymentPlans } from '../plans';
import { updateUserPolarPaymentDetails } from './userPaymentDetails';

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
    const polarEvent = constructPolarEvent(req);
    const prismaUserDelegate = context.entities.User;

    switch (polarEvent.type) {
      case 'order.paid':
        await handleOrderCompleted(polarEvent.data, prismaUserDelegate);

        break;
      case 'subscription.revoked':
        await handleSubscriptionRevoked(polarEvent.data, prismaUserDelegate);

        break;
      case 'subscription.uncanceled':
        await handleSubscriptionUncanceled(polarEvent.data, prismaUserDelegate);

        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(polarEvent.data, prismaUserDelegate);

        break;
      case 'subscription.canceled':
        await handleSubscriptionCanceled(polarEvent.data, prismaUserDelegate);

        break;
      case 'subscription.active':
        await handleSubscriptionActivated(polarEvent.data, prismaUserDelegate);

        break;
      default:
        throw new UnhandledWebhookEventError(`Unhandled Polar webhook event type: ${polarEvent.type}`);
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

function validateAndExtractCustomerData(data: Order | Subscription, eventType: string) {
  const customerId = data.customer.id;
  const userId = data.customer.externalId;

  if (!userId) {
    console.warn(`${eventType} event without customer.externalId (Wasp user ID)`);

    return null;
  }

  return { customerId, userId };
}

async function handleOrderCompleted(data: Order, userDelegate: PrismaClient['user']): Promise<void> {
  const customerData = validateAndExtractCustomerData(data, 'Order completed');

  if (!customerData) return;

  const { customerId, userId } = customerData;
  const paymentMode = data.metadata?.paymentMode;

  if (paymentMode !== 'payment') {
    console.log(`Order ${data.id} is not for credits (mode: ${paymentMode})`);
    return;
  }

  const creditsAmount = extractCreditsFromPolarOrder(data);

  console.log(`Order completed: ${data.id} for customer: ${customerId}, credits: ${creditsAmount}`);

  await updateUserPolarPaymentDetails(
    {
      userId,
      polarCustomerId: customerId,
      numOfCreditsPurchased: creditsAmount,
      datePaid: data.createdAt,
    },
    userDelegate
  );
}

async function handleSubscriptionStateChange(
  data: Subscription,
  userDelegate: PrismaClient['user'],
  eventType: string,
  statusOverride?: OpenSaasSubscriptionStatus,
  includePlanUpdate = false,
  includePaymentDate = false
): Promise<void> {
  const customerData = validateAndExtractCustomerData(data, eventType);

  if (!customerData) return;

  const { customerId, userId } = customerData;
  const subscriptionStatus = statusOverride || getSubscriptionStatus(data.status);
  const planId = includePlanUpdate && data.productId ? getPlanIdByProductId(data.productId) : undefined;

  console.log(`${eventType}: ${data.id}, customer: ${customerId}, status: ${subscriptionStatus}`);

  await updateUserPolarPaymentDetails(
    {
      userId,
      polarCustomerId: customerId,
      subscriptionStatus,
      ...(planId && { subscriptionPlan: planId }),
      ...(includePaymentDate && { datePaid: new Date() }),
      ...(data.status === 'active' && eventType === 'Subscription updated' && { datePaid: new Date() }),
    },
    userDelegate
  );
}

async function handleSubscriptionRevoked(
  data: Subscription,
  userDelegate: PrismaClient['user']
): Promise<void> {
  await handleSubscriptionStateChange(
    data,
    userDelegate,
    'Subscription revoked',
    OpenSaasSubscriptionStatus.Deleted
  );
}

/**
 * Handles subscription.update events, which are triggered for all changes to a subscription.
 *
 * Only updates the user record if the plan changed, otherwise delegates responsibility to the more specific event handlers.
 */
async function handleSubscriptionUpdated(
  data: Subscription,
  userDelegate: PrismaClient['user']
): Promise<void> {
  const customerData = validateAndExtractCustomerData(data, 'Subscription updated');

  if (!customerData) return;

  const { customerId, userId } = customerData;

  if (!data.productId) {
    return;
  }

  const currentUser = await userDelegate.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true },
  });

  const newPlanId = getPlanIdByProductId(data.productId);
  const currentPlanId = currentUser?.subscriptionPlan;

  if (!currentPlanId || currentPlanId === newPlanId) {
    return;
  }

  console.log(
    `Subscription updated: ${data.id}, customer: ${customerId}, plan changed from ${currentPlanId} to ${newPlanId}`
  );

  const subscriptionStatus = getSubscriptionStatus(data.status);

  await updateUserPolarPaymentDetails(
    {
      userId,
      polarCustomerId: customerId,
      subscriptionPlan: newPlanId,
      subscriptionStatus,
      ...(data.status === 'active' && { datePaid: new Date() }),
    },
    userDelegate
  );
}

async function handleSubscriptionUncanceled(
  data: Subscription,
  userDelegate: PrismaClient['user']
): Promise<void> {
  await handleSubscriptionStateChange(data, userDelegate, 'Subscription uncanceled', undefined, true);
}

async function handleSubscriptionCanceled(
  data: Subscription,
  userDelegate: PrismaClient['user']
): Promise<void> {
  await handleSubscriptionStateChange(
    data,
    userDelegate,
    'Subscription canceled',
    OpenSaasSubscriptionStatus.CancelAtPeriodEnd
  );
}

async function handleSubscriptionActivated(
  data: Subscription,
  userDelegate: PrismaClient['user']
): Promise<void> {
  await handleSubscriptionStateChange(
    data,
    userDelegate,
    'Subscription activated',
    OpenSaasSubscriptionStatus.Active,
    true,
    true
  );
}

function getSubscriptionStatus(polarStatus: SubscriptionStatus): OpenSaasSubscriptionStatus {
  const statusMap: Record<SubscriptionStatus, OpenSaasSubscriptionStatus> = {
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

function extractCreditsFromPolarOrder(order: Order): number {
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
