import type { CreateCheckoutSessionArgs, FetchCustomerPortalUrlArgs, PaymentProcessor } from '../paymentProcessor';
import { requireNodeEnvVar } from '../../server/utils';
import { createLemonSqueezyCheckoutSession } from './checkoutUtils';
import { lemonSqueezyWebhook, lemonSqueezyMiddlewareConfigFn } from './webhook';
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

lemonSqueezySetup({
  apiKey: requireNodeEnvVar('LEMONSQUEEZY_API_KEY'),
});

export const lemonSqueezyPaymentProcessor: PaymentProcessor = {
  id: 'lemonsqueezy',
  createCheckoutSession: async ({ userId, userEmail, paymentPlan }: CreateCheckoutSessionArgs) => {
    if (!userId) throw new Error('User ID needed to create Lemon Squeezy Checkout Session');
    const session = await createLemonSqueezyCheckoutSession({
      storeId: requireNodeEnvVar('LEMONSQUEEZY_STORE_ID'),
      variantId: paymentPlan.getPaymentProcessorPlanId(),
      userEmail,
      userId,
    });
    return { session };
  },
  fetchCustomerPortalUrl: async (args: FetchCustomerPortalUrlArgs) => {
    const user = await args.prismaUserDelegate.findUniqueOrThrow({
      where: {
        id: args.userId,
      },
      select: {
        lemonSqueezyCustomerPortalUrl: true,
      },
    });
    if (!user.lemonSqueezyCustomerPortalUrl) {
      console.log(`User with ID ${args.userId} does not have a LemonSqueezy customer portal URL`);
    } else {
      return user.lemonSqueezyCustomerPortalUrl;
    }
  },
  webhook: lemonSqueezyWebhook,
  webhookMiddlewareConfigFn: lemonSqueezyMiddlewareConfigFn,
};
