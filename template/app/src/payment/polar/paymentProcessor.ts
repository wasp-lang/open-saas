import express from 'express';
import { MiddlewareConfig } from 'wasp/server/middleware';
import {
  type CreateCheckoutSessionArgs,
  type FetchCustomerPortalUrlArgs,
  type PaymentProcessor,
} from '../paymentProcessor';
import { createPolarCheckoutSession, ensurePolarCustomer } from './checkoutUtils';
import { polarClient } from './polarClient';
import { polarWebhook } from './webhook';

export const polarPaymentProcessor: PaymentProcessor = {
  id: 'polar',
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate,
  }: CreateCheckoutSessionArgs) => {
    const customer = await ensurePolarCustomer(userId, userEmail);
    const session = await createPolarCheckoutSession({
      productId: paymentPlan.getPaymentProcessorPlanId(),
      customerId: customer.id,
    });

    await prismaUserDelegate.update({
      where: {
        id: userId,
      },
      data: {
        paymentProcessorUserId: customer.id,
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
      return null;
    }

    const customerSession = await polarClient.customerSessions.create({
      customerId: user.paymentProcessorUserId,
    });
  
    return customerSession.customerPortalUrl;
  },
  webhook: polarWebhook,
  webhookMiddlewareConfigFn: polarMiddlewareConfigFn,
};

function polarMiddlewareConfigFn(middlewareConfig: MiddlewareConfig): MiddlewareConfig {
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));

  return middlewareConfig;
}
