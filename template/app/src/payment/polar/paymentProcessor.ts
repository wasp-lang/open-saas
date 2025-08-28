import {
  type CreateCheckoutSessionArgs,
  type FetchCustomerPortalUrlArgs,
  type PaymentProcessor,
} from '../paymentProcessor';
import type { PaymentPlanEffect } from '../plans';
import { createPolarCheckoutSession } from './checkoutUtils';
import { polarClient } from './polarClient';
import { polarMiddlewareConfigFn, polarWebhook } from './webhook';

export type PolarMode = 'subscription' | 'payment';

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

    if (user?.paymentProcessorUserId) {
      const customerSession = await polarClient.customerSessions.create({
        customerId: user.paymentProcessorUserId,
      });

      return customerSession.customerPortalUrl;
    }

    return null;
  },
  webhook: polarWebhook,
  webhookMiddlewareConfigFn: polarMiddlewareConfigFn,
};

function paymentPlanEffectToPolarMode(planEffect: PaymentPlanEffect): PolarMode {
  const effectToMode: Record<PaymentPlanEffect['kind'], PolarMode> = {
    subscription: 'subscription',
    credits: 'payment',
  };

  return effectToMode[planEffect.kind];
}
