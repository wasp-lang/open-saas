import type { CreateCheckoutSessionArgs, FetchCustomerPortalUrlArgs, PaymentProcessor } from '../paymentProcessor';
import { requireNodeEnvVar } from '../../server/utils';
import { createLemonSqueezyCheckoutSession } from './checkoutUtils';
import { lemonSqueezyWebhook, lemonSqueezyMiddlewareConfigFn } from './webhook';
import { lemonSqueezySetup, listOrders } from '@lemonsqueezy/lemonsqueezy.js';
import { PaymentProcessors } from '../types';

lemonSqueezySetup({
  apiKey: requireNodeEnvVar('LEMONSQUEEZY_API_KEY'),
});

/**
 * Calculates total revenue from LemonSqueezy orders
 * @returns Promise resolving to total revenue in dollars
 */
async function fetchTotalLemonSqueezyRevenue(): Promise<number> {
  try {
    let totalRevenue = 0;
    let hasNextPage = true;
    let currentPage = 1;

    while (hasNextPage) {
      const { data: response } = await listOrders({
        filter: {
          storeId: process.env.LEMONSQUEEZY_STORE_ID,
        },
        page: {
          number: currentPage,
          size: 100,
        },
      });

      if (response?.data) {
        for (const order of response.data) {
          totalRevenue += order.attributes.total;
        }
      }

      hasNextPage = !response?.meta?.page.lastPage;
      currentPage++;
    }

    // Revenue is in cents so we convert to dollars (or your main currency unit)
    return totalRevenue / 100;
  } catch (error) {
    console.error('Error fetching Lemon Squeezy revenue:', error);
    throw error;
  }
}

export const lemonSqueezyPaymentProcessor: PaymentProcessor = {
  id: PaymentProcessors.LemonSqueezy,
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
    // Note that Lemon Squeezy assigns a unique URL to each user after the first successful payment.
    // This is handled in the Lemon Squeezy webhook.
    return user.lemonSqueezyCustomerPortalUrl;
  },
  getTotalRevenue: fetchTotalLemonSqueezyRevenue,
  webhook: lemonSqueezyWebhook,
  webhookMiddlewareConfigFn: lemonSqueezyMiddlewareConfigFn,
};
