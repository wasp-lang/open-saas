import { type MiddlewareConfigFn, HttpError } from 'wasp/server';
import { type PaymentsWebhook } from 'wasp/server/api';
import { type PrismaClient } from '@prisma/client';
import express from 'express';
import { paymentPlans, PaymentPlanId, SubscriptionStatus, type PaymentPlanEffect } from '../plans';
import { updateUserPaddlePaymentDetails } from './paymentDetails';
import { requireNodeEnvVar } from '../../server/utils';
import { assertUnreachable } from '../../shared/utils';
import { UnhandledWebhookEventError } from '../errors';
import { paddle } from './paddleClient';
import { EventEntity, EventName } from '@paddle/paddle-node-sdk';

export const paddleWebhook: PaymentsWebhook = async (request, response, context) => {
  try {
    const eventData = await parseRequestBody(request);
    const prismaUserDelegate = context.entities.User;

    switch (eventData.eventType) {
      case 'subscription.created':
        await handleSubscriptionCreated(eventData, prismaUserDelegate);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(eventData, prismaUserDelegate);
        break;
      case 'subscription.canceled':
        await handleSubscriptionCanceled(eventData, prismaUserDelegate);
        break;
      default:
        // @ts-ignore
        assertUnreachable(eventData.eventType);
    }

    return response.status(200).json({ received: true });
  } catch (err) {
    if (err instanceof UnhandledWebhookEventError) {
      console.error(err.message);
      return response.status(422).json({ error: err.message });
    }

    console.error('Paddle webhook error:', err);
    if (err instanceof HttpError) {
      return response.status(err.statusCode).json({ error: err.message });
    } else {
      return response.status(400).json({ error: 'Error processing Paddle webhook event' });
    }
  }
};

async function parseRequestBody(request: express.Request): Promise<EventEntity> {
  const requestBody = request.body.toString();
  const signature = request.get('paddle-signature');

  if (!signature) {
    throw new HttpError(400, 'Paddle webhook signature not provided');
  }

  const webhookSecret = requireNodeEnvVar('PADDLE_WEBHOOK_SECRET');

  // Verify the webhook signature
  const eventData = await paddle.webhooks.unmarshal(requestBody, webhookSecret, signature);

  return eventData;
}

export const paddleMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig) => {
  // Use raw middleware for webhook signature verification
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};

async function handleSubscriptionCreated(eventData: EventEntity, prismaUserDelegate: PrismaClient['user']) {
  if (eventData.eventType !== EventName.SubscriptionCreated) return;

  if (!eventData.data.customerId) {
    throw new Error(`No customer ID found in transaction ${eventData.data.id}`);
  }

  const priceId = eventData.data.items[0].price?.id as string;
  const planId = getPlanIdByPriceId(priceId);
  const plan = paymentPlans[planId];

  const { numOfCreditsPurchased, subscriptionPlan } = getPlanEffectPaymentDetails({
    planId,
    planEffect: plan.effect,
  });

  await updateUserPaddlePaymentDetails(
    {
      paddleCustomerId: eventData.data.customerId,
      // @ts-ignore userId isn't typed as it's custom data
      userId: eventData.data.customData?.userId as string,
      numOfCreditsPurchased,
      subscriptionPlan,
      subscriptionStatus: subscriptionPlan ? SubscriptionStatus.Active : undefined,
      datePaid: new Date(),
    },
    prismaUserDelegate
  );

  console.log(`Transaction ${eventData.data.id} completed for customer ${eventData.data.customerId}`);
}

async function handleSubscriptionUpdated(eventData: EventEntity, prismaUserDelegate: PrismaClient['user']) {
  if (eventData.eventType !== EventName.SubscriptionUpdated) return;

  const subscription = eventData.data;
  const priceId = subscription.items[0].price?.id as string;
  const planId = getPlanIdByPriceId(priceId);

  // @ts-ignore userId isn't typed as it's custom data
  const userId = subscription.customData?.userId as string | undefined;

  let subscriptionStatus: SubscriptionStatus;

  // Check for scheduled changes
  if (subscription.scheduledChange && subscription.scheduledChange !== null) {
    switch (subscription.scheduledChange.action) {
      case 'cancel':
        // Subscription is scheduled to cancel but still active until effective_at
        subscriptionStatus =
          subscription.status === 'active' ? SubscriptionStatus.Active : SubscriptionStatus.Deleted;
        console.log(
          `Subscription ${subscription.id} scheduled to cancel on ${subscription.scheduledChange.effectiveAt}`
        );
        break;
      case 'pause':
        // Subscription is scheduled to pause but still active until effective_at
        subscriptionStatus =
          subscription.status === 'active' ? SubscriptionStatus.Active : SubscriptionStatus.PastDue;
        console.log(
          `Subscription ${subscription.id} scheduled to pause on ${subscription.scheduledChange.effectiveAt}`
        );
        break;
      case 'resume':
        // Subscription is scheduled to resume
        subscriptionStatus =
          subscription.status === 'paused' ? SubscriptionStatus.PastDue : SubscriptionStatus.Active;
        console.log(
          `Subscription ${subscription.id} scheduled to resume on ${
            subscription.scheduledChange.resumeAt || subscription.scheduledChange.effectiveAt
          }`
        );
        break;
      default:
        // Fallback to regular status handling
        subscriptionStatus = getSubscriptionStatusFromPaddleStatus(subscription.status, subscription.id);
    }
  } else {
    // No scheduled changes, handle based on current status
    subscriptionStatus = getSubscriptionStatusFromPaddleStatus(subscription.status, subscription.id);
  }

  const user = await updateUserPaddlePaymentDetails(
    {
      paddleCustomerId: subscription.customerId,
      userId,
      subscriptionPlan: planId,
      subscriptionStatus,
      ...(subscription.status === 'active' && { datePaid: new Date() }),
    },
    prismaUserDelegate
  );

  console.log(`Subscription ${subscription.id} updated for customer ${subscription.customerId}`);
}

async function handleSubscriptionCanceled(eventData: EventEntity, prismaUserDelegate: PrismaClient['user']) {
  if (eventData.eventType !== EventName.SubscriptionCanceled) return;

  await updateUserPaddlePaymentDetails(
    {
      paddleCustomerId: eventData.data.customerId,
      // @ts-ignore userId is not typed in customData
      userId: eventData.data.customData?.userId as string,
      subscriptionStatus: SubscriptionStatus.Deleted,
    },
    prismaUserDelegate
  );

  console.log(`Subscription ${eventData.data.id} canceled for customer ${eventData.data.customerId}`);
}

function getPlanIdByPriceId(priceId: string): PaymentPlanId {
  const planId = Object.values(PaymentPlanId).find(
    (planId) => paymentPlans[planId].getPaymentProcessorPlanId() === priceId
  );
  if (!planId) {
    throw new Error(`No plan found with Paddle price ID: ${priceId}`);
  }
  return planId;
}

function getPlanEffectPaymentDetails({
  planId,
  planEffect,
}: {
  planId: PaymentPlanId;
  planEffect: PaymentPlanEffect;
}): {
  subscriptionPlan: PaymentPlanId | undefined;
  numOfCreditsPurchased: number | undefined;
} {
  switch (planEffect.kind) {
    case 'subscription':
      return { subscriptionPlan: planId, numOfCreditsPurchased: undefined };
    case 'credits':
      return { subscriptionPlan: undefined, numOfCreditsPurchased: planEffect.amount };
    default:
      assertUnreachable(planEffect);
  }
}

function getSubscriptionStatusFromPaddleStatus(status: string, subscriptionId: string): SubscriptionStatus {
  switch (status) {
    case 'active':
      return SubscriptionStatus.Active;
    case 'past_due':
      return SubscriptionStatus.PastDue;
    case 'canceled':
      return SubscriptionStatus.Deleted;
    case 'paused':
      // Treating paused as past due for now
      return SubscriptionStatus.PastDue;
    default:
      console.log(`Ignoring subscription ${subscriptionId} with status: ${status}`);
      return SubscriptionStatus.PastDue; // Safe fallback
  }
}
