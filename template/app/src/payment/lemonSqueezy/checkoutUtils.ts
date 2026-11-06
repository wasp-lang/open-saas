import { type Checkout, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { env } from "wasp/server";
import { CHECKOUT_SUCCESS_URL } from "../paths";

interface CreateLemonSqueezyCheckoutArgs {
  variantId: string;
  userId: string;
  userEmail: string;
}

/**
 * Lemon Squeezy checkouts can't be tied to an existing customer.
 * Instead, we pass the user ID as custom data, which Lemon Squeezy includes
 * in the webhook events for the resulting order and subscription.
 */
export async function createLemonSqueezyCheckout({
  variantId,
  userId,
  userEmail,
}: CreateLemonSqueezyCheckoutArgs): Promise<Checkout> {
  const { data: checkout, error } = await createCheckout(
    env.LEMONSQUEEZY_STORE_ID,
    variantId,
    {
      checkoutData: {
        email: userEmail,
        custom: { user_id: userId },
      },
      productOptions: {
        redirectUrl: CHECKOUT_SUCCESS_URL,
      },
    },
  );
  if (error) {
    throw error;
  }

  return checkout;
}
