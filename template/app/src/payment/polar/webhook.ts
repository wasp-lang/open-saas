import { Order } from '@polar-sh/sdk/models/components/order.js';
import { Subscription } from '@polar-sh/sdk/models/components/subscription.js';
import { SubscriptionStatus } from '@polar-sh/sdk/models/components/subscriptionstatus.js';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import express from 'express';
import type { PrismaClient } from 'wasp/server';
import type { PaymentsWebhook } from 'wasp/server/api';
import { requireNodeEnvVar } from '../../server/utils';
import { UnhandledWebhookEventError } from '../errors';
import { SubscriptionStatus as OpenSaasSubscriptionStatus, PaymentPlanId, paymentPlans } from '../plans';
import type { UpdateUserPaymentDetailsArgs } from './types';
import { OrderBillingReason } from '@polar-sh/sdk/models/components/orderbillingreason.js';

export const polarWebhook: PaymentsWebhook = async (req, res, context) => {
  try {
    const polarEvent = constructPolarEvent(req);
    const prismaUserDelegate = context.entities.User;

    switch (polarEvent.type) {
      case 'order.paid':
        await handleOrderPaid(polarEvent.data, prismaUserDelegate);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(polarEvent.data, prismaUserDelegate);
        break;
      default:
        throw new UnhandledWebhookEventError(polarEvent.type);
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

function constructPolarEvent(request: express.Request): ReturnType<typeof validateEvent> {
  const secret = requireNodeEnvVar('POLAR_WEBHOOK_SECRET');

  return validateEvent(request.body, request.headers as Record<string, string>, secret);
}

async function handleOrderPaid(order: Order, userDelegate: PrismaClient['user']): Promise<void> {
  assertCustomerExternalIdExists(order.customer.externalId);

  const polarCustomerId = order.customerId;
  const numOfCreditsPurchased =
    order.billingReason === OrderBillingReason.Purchase ? getCredits(order) : undefined;

  await updateUserPaymentDetails(
    {
      polarCustomerId,
      numOfCreditsPurchased,
      datePaid: order.createdAt,
    },
    userDelegate
  );
  console.log(
    `Order completed: ${order.id} for customer: ${polarCustomerId}, product: ${order.product.name}`
  );
}

async function handleSubscriptionUpdated(
  subscription: Subscription,
  userDelegate: PrismaClient['user']
): Promise<void> {
  assertCustomerExternalIdExists(subscription.customer.externalId);

  const polarCustomerId = subscription.customer.id;
  const waspUser = await userDelegate.findUnique({
    where: { paymentProcessorUserId: polarCustomerId },
    select: { subscriptionPlan: true, subscriptionStatus: true },
  });

  if (!waspUser) {
    throw new Error(`Subscription ${subscription.id} has no associated user`);
  }

  const currentPlanId = waspUser.subscriptionPlan as PaymentPlanId | null | undefined;
  const currentStatus = waspUser.subscriptionStatus as OpenSaasSubscriptionStatus | null | undefined;
  const newPlanId = getPlanIdByProductId(subscription.productId);
  const newStatus = mapPolarToOpenSaasSubscriptionStatus(subscription.status);
  const updateArgs: UpdateUserPaymentDetailsArgs = {
    polarCustomerId,
    subscriptionStatus: newStatus,
  };

  if (newStatus === OpenSaasSubscriptionStatus.Active && subscription.cancelAtPeriodEnd) {
    updateArgs.subscriptionStatus = OpenSaasSubscriptionStatus.CancelAtPeriodEnd;
  }

  if (currentPlanId !== newPlanId) {
    updateArgs.subscriptionPlan = newPlanId;
  }

  // Avoid updating the user if the subscription is unchanged (due to duplicate webhook events from Polar)
  if (!updateArgs.hasOwnProperty('subscriptionPlan') && updateArgs.subscriptionStatus === currentStatus) {
    return;
  }

  await updateUserPaymentDetails(updateArgs, userDelegate);
  console.log(`${subscription.product.name} subscription updated for customer: ${polarCustomerId}}`);
}

function assertCustomerExternalIdExists(externalId: string | null): asserts externalId is string {
  if (!externalId) {
    throw new Error('Customer external ID is required');
  }
}

function mapPolarToOpenSaasSubscriptionStatus(polarStatus: SubscriptionStatus): OpenSaasSubscriptionStatus {
  const statusMap: Record<SubscriptionStatus, OpenSaasSubscriptionStatus> = {
    active: OpenSaasSubscriptionStatus.Active,
    canceled: OpenSaasSubscriptionStatus.Deleted,
    past_due: OpenSaasSubscriptionStatus.PastDue,
    incomplete_expired: OpenSaasSubscriptionStatus.Deleted,
    incomplete: OpenSaasSubscriptionStatus.PastDue,
    trialing: OpenSaasSubscriptionStatus.Active,
    unpaid: OpenSaasSubscriptionStatus.PastDue,
  };

  return statusMap[polarStatus];
}

function getCredits(order: Order): number {
  const productId = order.productId;
  const planId = getPlanIdByProductId(productId);
  const plan = paymentPlans[planId];

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

async function updateUserPaymentDetails(
  args: UpdateUserPaymentDetailsArgs,
  userDelegate: PrismaClient['user']
) {
  const { polarCustomerId, subscriptionPlan, subscriptionStatus, numOfCreditsPurchased, datePaid } = args;

  return await userDelegate.update({
    where: {
      paymentProcessorUserId: polarCustomerId,
    },
    data: {
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
      credits: numOfCreditsPurchased !== undefined ? { increment: numOfCreditsPurchased } : undefined,
    },
  });
}
