import type {
  CreateCheckoutSessionArgs,
  FetchCustomerPortalUrlArgs,
  PaymentProcessor,
} from '../paymentProcessor';
import { updateUserPaymentProcessorUserId } from '../user';
import { createPayTheFlyCheckoutUrl } from './checkoutUtils';
import { payTheFlyMiddlewareConfigFn, payTheFlyWebhook } from './webhook';

export const payTheFlyPaymentProcessor: PaymentProcessor = {
  id: 'paythefly',
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate,
  }: CreateCheckoutSessionArgs) => {
    // PayTheFly uses wallet-based payments — no "customer" concept like Stripe.
    // We store the userId as the paymentProcessorUserId for webhook reconciliation.
    await updateUserPaymentProcessorUserId(
      { userId, paymentProcessorUserId: userId },
      prismaUserDelegate,
    );

    const checkoutUrl = await createPayTheFlyCheckoutUrl({
      userId,
      userEmail,
      paymentPlan,
    });

    return {
      session: {
        id: userId, // PayTheFly doesn't have session IDs — use userId as reference
        url: checkoutUrl,
      },
    };
  },
  fetchCustomerPortalUrl: async (_args: FetchCustomerPortalUrlArgs) => {
    // PayTheFly is a crypto payment processor — there is no customer portal.
    // Users manage their subscriptions through the SaaS app directly.
    return null;
  },
  webhook: payTheFlyWebhook,
  webhookMiddlewareConfigFn: payTheFlyMiddlewareConfigFn,
  fetchTotalRevenue: async () => {
    // PayTheFly doesn't provide a revenue listing API.
    // Revenue tracking is handled via webhook events stored in the database.
    // For admin dashboard, we rely on the DailyStats aggregation job.
    console.warn(
      'PayTheFly: fetchTotalRevenue is not supported. Revenue is tracked via webhook events.',
    );
    return 0;
  },
};
