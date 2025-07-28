import { Webhooks } from '@polar-sh/express';
import type { MiddlewareConfigFn } from 'wasp/server';
import type { PaymentsWebhook } from 'wasp/server/api';
import { getPolarApiConfig, mapPolarProductIdToPlanId } from './config';
import { updateUserPolarPaymentDetails } from './paymentDetails';
import { PolarSubscriptionStatus, isPolarSubscriptionStatus } from './types';

export const polarWebhook: PaymentsWebhook = async (req: any, res: any, _context: any) => {
  const config = getPolarApiConfig();
  
  const webhookHandler = Webhooks({
    webhookSecret: config.webhookSecret,

    /**
     * Handle checkout creation - mainly for logging
     * @param payload Polar webhook payload
     */
    onCheckoutCreated: async (payload) => {
      console.log('Polar checkout created:', (payload as any).id);
    },

    /**
     * Handle order creation - for one-time payments/credits
     * @param payload Polar webhook payload
     */
    onOrderCreated: async (payload) => {
      try {
        // TODO: Verify exact payload structure with Polar webhook documentation
        const data = payload as any;
        const customerId = data.customerId || data.customer_id;
        const metadata = data.metadata;
        const userId = metadata?.userId;
        const mode = metadata?.mode;

        if (!userId || mode !== 'payment') {
          console.warn('Order created without required metadata for credits processing');
          return;
        }

        // Extract credit amount from order - this will need refinement based on actual Polar order structure
        const creditsAmount = extractCreditsFromPolarOrder(data);

        await updateUserPolarPaymentDetails(
          {
            polarCustomerId: customerId,
            numOfCreditsPurchased: creditsAmount,
            datePaid: new Date(data.createdAt || data.created_at),
          },
          // TODO: Access to context entities needs to be passed through - this will need adjustment
          {} as any // Temporary placeholder
        );

        console.log(`Processed order ${data.id} for user ${userId}: ${creditsAmount} credits`);
      } catch (error) {
        console.error('Error handling order created:', error);
      }
    },

    /**
     * Handle subscription creation
     * @param payload Polar webhook payload
     */
    onSubscriptionCreated: async (payload) => {
      try {
        // TODO: Verify exact payload structure with Polar webhook documentation
        const data = payload as any;
        const customerId = data.customerId || data.customer_id;
        const productId = data.productId || data.product_id;
        const metadata = data.metadata;
        const userId = metadata?.userId;

        if (!userId) {
          console.warn('Subscription created without userId in metadata');
          return;
        }

        const planId = mapPolarProductIdToPlanId(productId);

        await updateUserPolarPaymentDetails(
          {
            polarCustomerId: customerId,
            subscriptionPlan: planId,
            subscriptionStatus: 'active',
            datePaid: new Date(data.createdAt || data.created_at),
          },
          {} as any // Temporary placeholder
        );

        console.log(`Subscription created for user ${userId}: ${data.id}`);
      } catch (error) {
        console.error('Error handling subscription created:', error);
      }
    },

    /**
     * Handle subscription updates (status changes, etc.)
     * @param payload Polar webhook payload
     */
    onSubscriptionUpdated: async (payload) => {
      try {
        // TODO: Verify exact payload structure with Polar webhook documentation
        const data = payload as any;
        const customerId = data.customerId || data.customer_id;
        const status = data.status;
        const productId = data.productId || data.product_id;

        const subscriptionStatus = mapPolarStatusToOpenSaaS(status);
        const planId = mapPolarProductIdToPlanId(productId);

        await updateUserPolarPaymentDetails(
          {
            polarCustomerId: customerId,
            subscriptionPlan: planId,
            subscriptionStatus,
            ...(status === 'active' && { datePaid: new Date() }),
          },
          {} as any // Temporary placeholder
        );

        console.log(`Subscription updated: ${data.id}, status: ${status}`);
      } catch (error) {
        console.error('Error handling subscription updated:', error);
      }
    },

    /**
     * Handle subscription becoming active
     * @param payload Polar webhook payload
     */
    onSubscriptionActive: async (payload) => {
      try {
        // TODO: Verify exact payload structure with Polar webhook documentation
        const data = payload as any;
        const customerId = data.customerId || data.customer_id;
        const productId = data.productId || data.product_id;

        const planId = mapPolarProductIdToPlanId(productId);

        await updateUserPolarPaymentDetails(
          {
            polarCustomerId: customerId,
            subscriptionPlan: planId,
            subscriptionStatus: 'active',
            datePaid: new Date(),
          },
          {} as any // Temporary placeholder
        );

        console.log(`Subscription activated: ${data.id}`);
      } catch (error) {
        console.error('Error handling subscription activated:', error);
      }
    },

    /**
     * Handle subscription cancellation
     * @param payload Polar webhook payload
     */
    onSubscriptionCanceled: async (payload) => {
      try {
        // TODO: Verify exact payload structure with Polar webhook documentation
        const data = payload as any;
        const customerId = data.customerId || data.customer_id;

        await updateUserPolarPaymentDetails(
          {
            polarCustomerId: customerId,
            subscriptionStatus: 'cancelled',
          },
          {} as any // TODO: Set correct type
        );

        console.log(`Subscription cancelled: ${data.id}`);
      } catch (error) {
        console.error('Error handling subscription cancelled:', error);
      }
    },
  });
  
  const next = (error?: any) => {
    if (error) {
      console.error('Polar webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  };
  
  webhookHandler(req, res, next);
};

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
 * @param orderData Order data from Polar webhook payload
 * @returns Number of credits purchased
 */
function extractCreditsFromPolarOrder(orderData: any): number {
  // TODO: Implement logic to extract credit amount from order data
  // This might involve looking at line items, product metadata, etc.
  return 10; // Default for now
}

export const polarMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig: any) => {
  const config = getPolarApiConfig();
  
  // Configure the Polar webhook handler as middleware
  const polarHandler = Webhooks({
    webhookSecret: config.webhookSecret,
    // ... handlers would be duplicated here - this needs refactoring
  });
  
  middlewareConfig.set('polar-webhook', polarHandler);
  return middlewareConfig;
};
