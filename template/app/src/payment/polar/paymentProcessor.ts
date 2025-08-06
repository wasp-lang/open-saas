// @ts-ignore
import { OrderStatus } from '@polar-sh/sdk/models/components/orderstatus.js';
import {
  type CreateCheckoutSessionArgs,
  type FetchCustomerPortalUrlArgs,
  type PaymentProcessor,
} from '../paymentProcessor';
import type { PaymentPlanEffect } from '../plans';
import { PaymentProcessors } from '../types';
import { createPolarCheckoutSession } from './checkoutUtils';
import { getPolarApiConfig } from './config';
import { polar } from './polarClient';
import { polarMiddlewareConfigFn, polarWebhook } from './webhook';

export type PolarMode = 'subscription' | 'payment';

/**
 * Calculates total revenue from Polar transactions
 * @returns Promise resolving to total revenue in dollars
 */
async function fetchTotalPolarRevenue(): Promise<number> {
  try {
    let totalRevenue = 0;

    const result = await polar.orders.list({
      limit: 100,
    });

    for await (const page of result) {
      const orders = page.result.items || [];

      for (const order of orders) {
        if (order.status === OrderStatus.Paid && order.totalAmount > 0) {
          totalRevenue += order.totalAmount;
        }
      }
    }

    return totalRevenue / 100;
  } catch (error) {
    console.error('Error calculating Polar total revenue:', error);
    return 0;
  }
}

export const polarPaymentProcessor: PaymentProcessor = {
  id: PaymentProcessors.Polar,
  /**
   * Creates a Polar checkout session for subscription or one-time payments
   * Handles customer creation/lookup automatically via externalCustomerId
   * @param args Checkout session arguments including user info and payment plan
   * @returns Promise resolving to checkout session with ID and redirect URL
   */
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate,
  }: CreateCheckoutSessionArgs) => {
    try {
      const session = await createPolarCheckoutSession({
        productId: paymentPlan.getPaymentProcessorPlanId(),
        userEmail,
        userId,
        mode: paymentPlanEffectToPolarMode(paymentPlan.effect),
      });

      if (session.customerId) {
        try {
          await prismaUserDelegate.update({
            where: {
              id: userId,
            },
            data: {
              paymentProcessorUserId: session.customerId,
            },
          });
        } catch (dbError) {
          console.error('Error updating user with Polar customer ID:', dbError);
        }
      }

      return {
        session: {
          id: session.id,
          url: session.url,
        },
      };
    } catch (error) {
      console.error('Error in Polar createCheckoutSession:', error);

      throw new Error(
        `Failed to create Polar checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
  fetchCustomerPortalUrl: async (args: FetchCustomerPortalUrlArgs) => {
    const defaultPortalUrl = getPolarApiConfig().customerPortalUrl;

    try {
      const user = await args.prismaUserDelegate.findUnique({
        where: {
          id: args.userId,
        },
        select: {
          paymentProcessorUserId: true,
        },
      });

      if (user?.paymentProcessorUserId) {
        try {
          const customerSession = await polar.customerSessions.create({
            customerId: user.paymentProcessorUserId,
          });

          return customerSession.customerPortalUrl;
        } catch (polarError) {
          console.error('Error creating Polar customer session:', polarError);
        }
      }

      return defaultPortalUrl;
    } catch (error) {
      console.error('Error fetching customer portal URL:', error);
      return defaultPortalUrl;
    }
  },
  getTotalRevenue: fetchTotalPolarRevenue,
  webhook: polarWebhook,
  webhookMiddlewareConfigFn: polarMiddlewareConfigFn,
};

/**
 * Maps a payment plan effect to a Polar mode
 * @param planEffect Payment plan effect
 * @returns Polar mode
 */
function paymentPlanEffectToPolarMode(planEffect: PaymentPlanEffect): PolarMode {
  const effectToMode: Record<PaymentPlanEffect['kind'], PolarMode> = {
    subscription: 'subscription',
    credits: 'payment',
  };
  return effectToMode[planEffect.kind];
}
