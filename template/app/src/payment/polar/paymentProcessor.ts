// @ts-ignore
import { OrderStatus } from '@polar-sh/sdk/models/components/orderstatus.js';
import {
  type CreateCheckoutSessionArgs,
  type FetchCustomerPortalUrlArgs,
  type PaymentProcessor,
} from '../paymentProcessor';
import type { PaymentPlanEffect } from '../plans';

import { createPolarCheckoutSession } from './checkoutUtils';
import { polar } from './polarClient';
import { polarMiddlewareConfigFn, polarWebhook } from './webhook';

export type PolarMode = 'subscription' | 'payment';

async function fetchTotalPolarRevenue(): Promise<number> {
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
}

export const polarPaymentProcessor: PaymentProcessor = {
  id: 'polar',
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

    if (!session.customerId) {
      throw new Error('Polar checkout session created without customer ID');
    }

    await prismaUserDelegate.update({
      where: {
        id: userId,
      },
      data: {
        paymentProcessorUserId: session.customerId,
      },
    });

    return {
      session: {
        id: session.id,
        url: session.url,
      },
    };
  },
  fetchCustomerPortalUrl: async (args: FetchCustomerPortalUrlArgs) => {
    const user = await args.prismaUserDelegate.findUnique({
      where: {
        id: args.userId,
      },
      select: {
        paymentProcessorUserId: true,
      },
    });

    if (!user?.paymentProcessorUserId) {
      throw new Error('No Polar customer ID found for user');
    }

    const customerSession = await polar.customerSessions.create({
      customerId: user.paymentProcessorUserId,
    });

    return customerSession.customerPortalUrl;
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
