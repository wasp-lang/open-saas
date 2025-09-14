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
import type { SubscriptionActionContext, UpdateUserPaymentDetailsArgs } from './types';
import { SubscriptionAction } from './types';

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

function assertCustomerExternalIdExists(externalId: string | null): asserts externalId is string {
  if (!externalId) {
    throw new Error('Customer external ID is required');
  }
}

async function handleOrderPaid(order: Order, userDelegate: PrismaClient['user']): Promise<void> {
  const customerId = order.customerId;
  const paymentMode = order.metadata?.paymentMode;

  if (paymentMode !== 'payment') {
    console.log(`Order ${order.id} is not for credits (mode: ${paymentMode})`);
    return;
  }

  const creditsAmount = getCredits(order);

  console.log(`Order completed: ${order.id} for customer: ${customerId}, credits: ${creditsAmount}`);

  await updateUserPaymentDetails(
    {
      polarCustomerId: customerId,
      numOfCreditsPurchased: creditsAmount,
      datePaid: order.createdAt,
    },
    userDelegate
  );
}

async function handleSubscriptionUpdated(
  subscription: Subscription,
  userDelegate: PrismaClient['user']
): Promise<void> {
  assertCustomerExternalIdExists(subscription.customer.externalId);

  const customerId = subscription.customer.id;

  if (!subscription.productId) {
    return;
  }

  const currentUser = await userDelegate.findUnique({
    where: { paymentProcessorUserId: customerId },
    select: { subscriptionPlan: true, subscriptionStatus: true },
  });

  const currentPlanId = currentUser?.subscriptionPlan as PaymentPlanId | null | undefined;
  const currentStatus = currentUser?.subscriptionStatus as OpenSaasSubscriptionStatus | null | undefined;
  const newPlanId = getPlanIdByProductId(subscription.productId);
  const newSubscriptionStatus = mapPolarToOpenSaasSubscriptionStatus(subscription.status);
  const action = getSubscriptionAction({
    currentPlanId,
    currentStatus,
    newPlanId,
    newSubscriptionStatus,
    subscription: subscription,
  });

  switch (action) {
    case SubscriptionAction.SKIP:
      console.log(`Subscription unchanged: ${subscription.id}, customer: ${customerId}`);

      return;

    case SubscriptionAction.CREATED:
      await applySubscriptionStateChange(
        subscription,
        userDelegate,
        'Subscription created',
        OpenSaasSubscriptionStatus.Active,
        true,
        true
      );

      return;

    case SubscriptionAction.CANCELLED:
      await applySubscriptionStateChange(
        subscription,
        userDelegate,
        'Subscription cancelled',
        OpenSaasSubscriptionStatus.CancelAtPeriodEnd
      );

      return;

    case SubscriptionAction.UNCANCELLED:
      await applySubscriptionStateChange(
        subscription,
        userDelegate,
        'Subscription uncancelled',
        undefined,
        true
      );

      return;

    case SubscriptionAction.UPDATED:
      await applySubscriptionStateChange(
        subscription,
        userDelegate,
        'Subscription plan updated',
        newSubscriptionStatus,
        true,
        true
      );
      return;

    case SubscriptionAction.REVOKED:
      await applySubscriptionStateChange(
        subscription,
        userDelegate,
        'Subscription revoked',
        OpenSaasSubscriptionStatus.Deleted
      );

      return;

    case SubscriptionAction.PAST_DUE:
      await applySubscriptionStateChange(
        subscription,
        userDelegate,
        'Subscription past due',
        OpenSaasSubscriptionStatus.PastDue
      );

      return;

    default:
      console.log(`Unexpected action: ${subscription.id}, customer: ${customerId}, action: ${action}`);

      return;
  }
}

async function applySubscriptionStateChange(
  subscription: Subscription,
  userDelegate: PrismaClient['user'],
  eventType: string,
  statusOverride?: OpenSaasSubscriptionStatus,
  includePlanUpdate = false,
  includePaymentDate = false
): Promise<void> {
  assertCustomerExternalIdExists(subscription.customer.externalId);

  const customerId = subscription.customer.id;
  const subscriptionStatus = statusOverride || mapPolarToOpenSaasSubscriptionStatus(subscription.status);
  const planId =
    includePlanUpdate && subscription.productId ? getPlanIdByProductId(subscription.productId) : undefined;

  console.log(`${eventType}: ${subscription.id}, customer: ${customerId}, status: ${subscriptionStatus}`);

  await updateUserPaymentDetails(
    {
      polarCustomerId: customerId,
      subscriptionStatus,
      ...(planId && { subscriptionPlan: planId }),
      ...(includePaymentDate && { datePaid: new Date() }),
      ...(subscription.status === SubscriptionStatus.Active &&
        eventType === 'Subscription updated' && { datePaid: new Date() }),
    },
    userDelegate
  );
}

function getSubscriptionAction({
  currentPlanId,
  currentStatus,
  newPlanId,
  subscription,
}: SubscriptionActionContext): SubscriptionAction {
  if (currentStatus === OpenSaasSubscriptionStatus.Deleted && currentPlanId === newPlanId) {
    return SubscriptionAction.SKIP;
  }

  if (subscription.status === SubscriptionStatus.Active) {
    if (!currentPlanId || currentStatus === OpenSaasSubscriptionStatus.Deleted) {
      return SubscriptionAction.CREATED;
    }

    if (
      subscription.canceledAt &&
      subscription.endsAt &&
      currentStatus !== OpenSaasSubscriptionStatus.CancelAtPeriodEnd
    ) {
      return SubscriptionAction.CANCELLED;
    }

    if (
      !subscription.canceledAt &&
      !subscription.endsAt &&
      currentStatus === OpenSaasSubscriptionStatus.CancelAtPeriodEnd
    ) {
      return SubscriptionAction.UNCANCELLED;
    }

    if (currentPlanId !== newPlanId) {
      return SubscriptionAction.UPDATED;
    }
  }

  if (subscription.status === SubscriptionStatus.Canceled) {
    return SubscriptionAction.REVOKED;
  }

  if (
    subscription.status === SubscriptionStatus.PastDue &&
    currentStatus !== OpenSaasSubscriptionStatus.PastDue
  ) {
    return SubscriptionAction.PAST_DUE;
  }

  return SubscriptionAction.SKIP;
}

function mapPolarToOpenSaasSubscriptionStatus(polarStatus: SubscriptionStatus): OpenSaasSubscriptionStatus {
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
