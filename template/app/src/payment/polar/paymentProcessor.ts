import {
  type CreateCheckoutSessionArgs,
  type FetchCustomerPortalUrlArgs,
  type PaymentProcessor,
} from '../paymentProcessor';
import type { PaymentPlanEffect } from '../plans';
import { createPolarCheckoutSession } from './checkoutUtils';
import { getPolarApiConfig } from './config';
import { polarMiddlewareConfigFn, polarWebhook } from './webhook';
import { PaymentProcessors } from '../types';

export type PolarMode = 'subscription' | 'payment';

/**
 * Calculates total revenue from Polar transactions
 * TODO: Implement actual revenue calculation using Polar SDK
 * @returns Promise resolving to total revenue in dollars
 */
async function fetchTotalPolarRevenue(): Promise<number> {
  // TODO: Implement actual Polar revenue calculation
  console.warn('Polar getTotalRevenue not yet implemented - returning 0');
  return 0;
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
  fetchCustomerPortalUrl: async (_args: FetchCustomerPortalUrlArgs) => {
    return getPolarApiConfig().customerPortalUrl;
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
