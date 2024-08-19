import type { CreateCheckoutSessionArgs, FetchCustomerPortalUrlArgs } from '../paymentProcessor';
import { requireNodeEnvVar } from '../../server/utils';
import { createLemonSqueezyCheckoutSession } from './checkoutUtils';

export const lemonSqueezyPaymentProcessor = {
  createCheckoutSession: async ({ userId, userEmail, paymentPlan }: CreateCheckoutSessionArgs) => {
    if (!userId) throw new Error('User ID needed to create Lemon Squeezy Checkout Session');
    const session = await createLemonSqueezyCheckoutSession({
      storeId: requireNodeEnvVar('PAYMENTS_LEMONSQUEEZY_STORE_ID'),
      variantId: paymentPlan.getPriceId(),
      userEmail,
      userId,
    });
    return { session };
  },
  fetchCustomerPortalUrl: async (args?: FetchCustomerPortalUrlArgs ) => {
    if (!args?.userId || !args?.prismaUserDelegate) throw new Error('Missing args from fetchCustomerPortalUrl')
    const user = await args.prismaUserDelegate.findUniqueOrThrow({
      where: {
        id: args.userId,
      },
      select: {
        lemonSqueezyCustomerPortalUrl: true,
      },
    });
    if (!user.lemonSqueezyCustomerPortalUrl) {
      throw new Error(`User with ID ${args.userId} does not have a LemonSqueezy customer portal URL`);
    }
    return user.lemonSqueezyCustomerPortalUrl;
  },
};
