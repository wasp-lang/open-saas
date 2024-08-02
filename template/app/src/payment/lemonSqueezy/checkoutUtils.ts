import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { initLemonSqueezy } from './initLemonSqueezySetup';

initLemonSqueezy();

type LemonSqueezyCheckoutSessionParams = {
  storeId: string;
  variantId: string;
  userEmail: string;
  userId: string;
};

type LemonSqueezyCheckoutSession = {
  sessionUrl: string;
  sessionId: string;
};

export async function createLemonSqueezyCheckoutSession({ storeId, variantId, userEmail, userId }: LemonSqueezyCheckoutSessionParams): Promise<LemonSqueezyCheckoutSession> {
  const { data: checkout, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: userEmail,
      custom: {
        user_id: userId // You app's unique user ID is sent on checkout, and it's returned in the webhook so we can easily identify the user.
      }
    }
  });
  if (error) {
    throw error;
  }
  if (!checkout) {
    throw new Error('Checkout not found');
  }
  return {
    sessionUrl: checkout.data.attributes.url,
    sessionId: checkout.data.id,
  };
}
