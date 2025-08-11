import Stripe from 'stripe';
import { stripeClient } from './stripeClient';

// WASP_WEB_CLIENT_URL will be set up by Wasp when deploying to production: https://wasp.sh/docs/deploying
const CLIENT_BASE_URL = process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000';

/**
 * Returns a Stripe customer for the given User email, creating a customer if none exist.
 * Implements email uniqueness logic since Stripe doesn't enforce unique emails.
 */
export async function ensureStripeCustomer(userEmail: string): Promise<Stripe.Customer> {
  try {
    const stripeCustomers = await stripeClient.customers.list({
      email: userEmail,
    });

    if (stripeCustomers.data.length === 0) {
      console.log('Creating a new Stripe customer');
      return stripeClient.customers.create({
        email: userEmail,
      });
    } else {
      console.log('Using an existing Stripe customer');
      return stripeCustomers.data[0];
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

interface CreateStripeCheckoutSessionParams {
  priceId: string;
  customerId: string;
  mode: Stripe.Checkout.Session.Mode;
}

export async function createStripeCheckoutSession({
  priceId,
  customerId,
  mode,
}: CreateStripeCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  try {
    return await stripeClient.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${CLIENT_BASE_URL}/checkout?success=true`,
      cancel_url: `${CLIENT_BASE_URL}/checkout?canceled=true`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      customer_update: {
        address: 'auto',
      },
      invoice_creation:
        mode === 'payment'
          ? {
              enabled: true,
            }
          : undefined,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
