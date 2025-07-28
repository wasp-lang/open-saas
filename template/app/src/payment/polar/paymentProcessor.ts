import {
  type CreateCheckoutSessionArgs,
  type FetchCustomerPortalUrlArgs,
  type PaymentProcessor,
} from '../paymentProcessor';
import type { PaymentPlanEffect } from '../plans';
import { createPolarCheckoutSession } from './checkoutUtils';
import { getPolarApiConfig } from './config';
import { polar } from './polarClient';
import { polarMiddlewareConfigFn, polarWebhook } from './webhook';
import { PaymentProcessors } from '../types';

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
      const orders = (page as any).items || [];
      
      for (const order of orders) {
        if (order.status === 'completed' && typeof order.amount === 'number' && order.amount > 0) {
          totalRevenue += order.amount;
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
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate,
  }: CreateCheckoutSessionArgs) => {
    const session = await createPolarCheckoutSession({
      productId: paymentPlan.getPaymentProcessorPlanId(),
      userEmail,
      userId,
      mode: paymentPlanEffectToPolarMode(paymentPlan.effect),
    });

    if (session.customerId) {
      await prismaUserDelegate.update({
        where: {
          id: userId,
        },
        data: {
          paymentProcessorUserId: session.customerId,
        },
      });
    }

    return {
      session: {
        id: session.id,
        url: session.url,
      },
    };
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
