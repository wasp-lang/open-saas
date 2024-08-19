import { createLemonSqueezyCheckoutSession } from './checkoutUtils';
import type { PaymentPlan } from '../plans'
import { requireNodeEnvVar } from '../../server/utils';

export const lsPaymentProcessor = {
  createCheckoutSession: async ({ userId, userEmail, paymentPlan}: { userId: string | undefined, userEmail: string, paymentPlan: PaymentPlan}) => {
    if (!userId) throw new Error('User ID needed to create Lemon Squeezy Checkout Session')
    const session = await createLemonSqueezyCheckoutSession({
      storeId: requireNodeEnvVar('LEMONSQUEEZY_STORE_ID'),
      variantId: paymentPlan.getProductId(),
      userEmail,
      userId
    });
    if (!session.url || !session.id) throw new Error('Error creating Lemon Squeezy Checkout Session')
    return { session }
  }
}
