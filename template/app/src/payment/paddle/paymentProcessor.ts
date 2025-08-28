import type {
  CreateCheckoutSessionArgs,
  FetchCustomerPortalUrlArgs,
  PaymentProcessor,
} from '../paymentProcessor';
import { createPaddleCheckoutSession } from './checkoutUtils';
import { paddleWebhook, paddleMiddlewareConfigFn } from './webhook';
import { paddle } from './paddleClient';

export const paddlePaymentProcessor: PaymentProcessor = {
  id: 'paddle',
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate,
  }: CreateCheckoutSessionArgs) => {
    const session = await createPaddleCheckoutSession({
      priceId: paymentPlan.getPaymentProcessorPlanId(),
      customerEmail: userEmail,
      userId,
    });

    return { session };
  },
  fetchCustomerPortalUrl: async ({ userId, prismaUserDelegate }: FetchCustomerPortalUrlArgs) => {
    const user = await prismaUserDelegate.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        paymentProcessorUserId: true,
      },
    });

    if (!user.paymentProcessorUserId) {
      return null;
    }

    try {
      // Get customer subscriptions to find an active one for the portal URL
      const subscriptionCollection = paddle.subscriptions.list({
        customerId: [user.paymentProcessorUserId],
      });

      const subscriptions = await subscriptionCollection.next();

      if (subscriptions.length === 0) {
        return null;
      }

      const activeSubscription = subscriptions.find((sub) => sub.status === 'active');
      if (activeSubscription?.managementUrls?.updatePaymentMethod) {
        return activeSubscription.managementUrls.updatePaymentMethod;
      }

      // Fallback to cancel URL if no update payment method URL is available - shouldn't happen
      if (activeSubscription?.managementUrls?.cancel) {
        return activeSubscription.managementUrls.cancel;
      }

      return null;
    } catch (error) {
      console.error('Error fetching Paddle customer portal URL:', error);
      return null;
    }
  },
  webhook: paddleWebhook,
  webhookMiddlewareConfigFn: paddleMiddlewareConfigFn,
};
