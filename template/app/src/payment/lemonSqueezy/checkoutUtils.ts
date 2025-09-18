import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

interface LemonSqueezyCheckoutSessionParams {
  storeId: string;
  variantId: string;
  userEmail: string;
  userId: string;
};

export async function createLemonSqueezyCheckoutSession({ storeId, variantId, userEmail, userId }: LemonSqueezyCheckoutSessionParams) {
  const { data: session, error } = await createCheckout(storeId, variantId, {
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
  if (!session) {
    throw new Error('Checkout not found');
  }
  return {
    url: session.data.attributes.url,
    id: session.data.id,
  };
}
