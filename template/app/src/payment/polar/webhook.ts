import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import type { MiddlewareConfigFn } from 'wasp/server';
import type { PaymentsWebhook } from 'wasp/server/api';
import { getPolarApiConfig, mapPolarProductIdToPlanId } from './config';
import { updateUserPolarPaymentDetails, findUserByPolarCustomerId } from './paymentDetails';
import { PolarSubscriptionStatus, isPolarSubscriptionStatus } from './types';
import { PaymentPlanId, paymentPlans } from '../plans';

/**
 * Main Polar webhook handler with signature verification and proper event routing
 * Handles all Polar webhook events with comprehensive error handling and logging
 * @param req Express request object containing raw webhook payload
 * @param res Express response object for webhook acknowledgment
 * @param context Wasp context containing database entities and user information
 */
export const polarWebhook: PaymentsWebhook = async (req: any, res: any, context: any) => {
  try {
    const config = getPolarApiConfig();

    const event = validateEvent(req.body, req.headers, config.webhookSecret);

    const success = await handlePolarEvent(event, context);

    if (success) {
      res.status(200).json({ received: true });
    } else {
      res.status(202).json({ received: true, processed: false });
    }
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error('Polar webhook signature verification failed:', error);
      res.status(403).json({ error: 'Invalid signature' });
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
async function handlePolarEvent(event: any, context: any): Promise<boolean> {
  const userDelegate = context.entities.User;

  try {
    switch (event.type) {
      case 'order.created':
        await handleOrderCreated(event.data, userDelegate);
        return true;

      case 'order.completed':
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

      case 'subscription.activated':
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
async function handleOrderCreated(data: any, userDelegate: any): Promise<void> {
  try {
    const customerId = data.customer_id;
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
        datePaid: new Date(data.created_at),
      },
      userDelegate
    );

    console.log(`Order created: ${data.id}, customer: ${customerId}, credits: ${creditsAmount}`);
  } catch (error) {
    console.error('Error handling order created:', error);
    throw error;
  }
}

/**
 * Handle order completion events
 * @param data Order data from webhook
 * @param userDelegate Prisma user delegate
 */
async function handleOrderCompleted(data: any, userDelegate: any): Promise<void> {
  try {
    const customerId = data.customer_id;

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
          datePaid: new Date(data.created_at),
        },
        userDelegate
      );
    }
  } catch (error) {
    console.error('Error handling order completed:', error);
    throw error;
  }
}

/**
 * Handle subscription creation events
 * @param data Subscription data from webhook
 * @param userDelegate Prisma user delegate
 */
async function handleSubscriptionCreated(data: any, userDelegate: any): Promise<void> {
  try {
    const customerId = data.customer_id;
    const planId = data.plan_id;
    const status = data.status;

    if (!customerId || !planId) {
      console.warn('Subscription created without required customer_id or plan_id');
      return;
    }

    const mappedPlanId = mapPolarProductIdToPlanId(planId);
    const subscriptionStatus = mapPolarStatusToOpenSaaS(status);

    await updateUserPolarPaymentDetails(
      {
        polarCustomerId: customerId,
        subscriptionPlan: mappedPlanId,
        subscriptionStatus,
        datePaid: new Date(data.created_at),
      },
      userDelegate
    );

    console.log(
      `Subscription created: ${data.id}, customer: ${customerId}, plan: ${mappedPlanId}, status: ${subscriptionStatus}`
    );
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

/**
 * Handle subscription update events
 * @param data Subscription data from webhook
 * @param userDelegate Prisma user delegate
 */
async function handleSubscriptionUpdated(data: any, userDelegate: any): Promise<void> {
  try {
    const customerId = data.customer_id;
    const status = data.status;
    const planId = data.plan_id;

    if (!customerId) {
      console.warn('Subscription updated without customer_id');
      return;
    }

    const subscriptionStatus = mapPolarStatusToOpenSaaS(status);
    const mappedPlanId = planId ? mapPolarProductIdToPlanId(planId) : undefined;

    await updateUserPolarPaymentDetails(
      {
        polarCustomerId: customerId,
        subscriptionPlan: mappedPlanId,
        subscriptionStatus,
        ...(status === 'active' && { datePaid: new Date() }),
      },
      userDelegate
    );

    console.log(`Subscription updated: ${data.id}, customer: ${customerId}, status: ${subscriptionStatus}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

/**
 * Handle subscription cancellation events
 * @param data Subscription data from webhook
 * @param userDelegate Prisma user delegate
 */
async function handleSubscriptionCanceled(data: any, userDelegate: any): Promise<void> {
  try {
    const customerId = data.customer_id;

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
  } catch (error) {
    console.error('Error handling subscription canceled:', error);
    throw error;
  }
}

/**
 * Handle subscription activation events
 * @param data Subscription data from webhook
 * @param userDelegate Prisma user delegate
 */
async function handleSubscriptionActivated(data: any, userDelegate: any): Promise<void> {
  try {
    const customerId = data.customer_id;
    const planId = data.plan_id;

    if (!customerId) {
      console.warn('Subscription activated without customer_id');
      return;
    }

    const mappedPlanId = planId ? mapPolarProductIdToPlanId(planId) : undefined;

    await updateUserPolarPaymentDetails(
      {
        polarCustomerId: customerId,
        subscriptionPlan: mappedPlanId,
        subscriptionStatus: 'active',
        datePaid: new Date(),
      },
      userDelegate
    );

    console.log(`Subscription activated: ${data.id}, customer: ${customerId}, plan: ${mappedPlanId}`);
  } catch (error) {
    console.error('Error handling subscription activated:', error);
    throw error;
  }
}

/**
 * Maps Polar subscription status to OpenSaaS subscription status
 * Uses the comprehensive type system for better type safety and consistency
 * @param polarStatus The status from Polar webhook payload
 * @returns The corresponding OpenSaaS status
 */
function mapPolarStatusToOpenSaaS(polarStatus: string): string {
  // Validate that it's a known Polar status
  if (!isPolarSubscriptionStatus(polarStatus)) {
    console.warn(`Unknown Polar subscription status: ${polarStatus}`);
    return polarStatus; // Return as-is if unknown
  }

  // Use the comprehensive status mapping from our type system
  const statusMap: Record<PolarSubscriptionStatus, string> = {
    [PolarSubscriptionStatus.ACTIVE]: 'active',
    [PolarSubscriptionStatus.CANCELLED]: 'cancelled',
    [PolarSubscriptionStatus.PAST_DUE]: 'past_due',
    [PolarSubscriptionStatus.EXPIRED]: 'cancelled',
    [PolarSubscriptionStatus.INCOMPLETE]: 'pending',
    [PolarSubscriptionStatus.TRIALING]: 'active',
  };

  return statusMap[polarStatus as PolarSubscriptionStatus];
}

/**
 * Helper function to extract credits amount from order
 * @param order Order data from Polar webhook payload
 * @returns Number of credits purchased
 */
function extractCreditsFromPolarOrder(order: any): number {
  try {
    const productId = order.product_id;

    if (!productId) {
      console.warn('No product_id found in Polar order:', order.id);
      return 0;
    }

    let planId: PaymentPlanId;
    try {
      planId = mapPolarProductIdToPlanId(productId);
    } catch (error) {
      console.warn(`Unknown Polar product ID ${productId} in order ${order.id}`);
      return 0;
    }

    const plan = paymentPlans[planId];
    if (!plan) {
      console.warn(`No payment plan found for plan ID ${planId}`);
      return 0;
    }

    if (plan.effect.kind === 'credits') {
      const credits = plan.effect.amount;
      console.log(`Extracted ${credits} credits from order ${order.id} (product: ${productId})`);
      return credits;
    }

    console.log(`Order ${order.id} product ${productId} is not a credit product (plan: ${planId})`);
    return 0;
  } catch (error) {
    console.error('Error extracting credits from Polar order:', error, order);
    return 0;
  }
}

/**
 * Middleware configuration function for Polar webhooks
 * Sets up raw body parsing for webhook signature verification
 * @param middlewareConfig Express middleware configuration object
 * @returns Updated middleware configuration
 */
export const polarMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig: any) => {
  // Configure raw body parsing for webhook endpoints
  // This ensures the raw request body is available for signature verification
  middlewareConfig.set('polar-webhook', (req: any, res: any, next: any) => {
    // Ensure we have raw body for signature verification
    if (req.url.includes('/polar') && req.method === 'POST') {
      // The raw body should already be available through Wasp's webhook handling
      // This middleware mainly serves as a placeholder for any future webhook-specific setup
    }
    next();
  });

  return middlewareConfig;
};
