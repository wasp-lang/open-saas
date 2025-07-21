import type { StripeMode } from './paymentProcessor';

import Stripe from 'stripe';
import { stripe } from './stripeClient';
import { assertUnreachable } from '../../shared/utils';

// WASP_WEB_CLIENT_URL will be set up by Wasp when deploying to production: https://wasp.sh/docs/deploying
const DOMAIN = process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000';

export async function fetchStripeCustomer(customerEmail: string) {
  let customer: Stripe.Customer;
  try {
    const stripeCustomers = await stripe.customers.list({
      email: customerEmail,
    });
    if (!stripeCustomers.data.length) {
      console.log('creating customer');
      customer = await stripe.customers.create({
        email: customerEmail,
      });
    } else {
      console.log('using existing customer');
      customer = stripeCustomers.data[0];
    }
    return customer;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

interface CreateStripeCheckoutSessionParams {
  priceId: string;
  customerId: string;
  mode: StripeMode;
}

export async function createStripeCheckoutSession({
  priceId,
  customerId,
  mode,
}: CreateStripeCheckoutSessionParams) {
  try {
    const paymentIntentData = getPaymentIntentData({ mode, priceId });

    return await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${DOMAIN}/checkout?success=true`,
      cancel_url: `${DOMAIN}/checkout?canceled=true`,
      automatic_tax: { enabled: true },
      customer_update: {
        address: 'auto',
      },
      customer: customerId,
      // Stripe only allows us to pass payment intent metadata for one-time payments, not subscriptions.
      // We do this so that we can capture priceId in the payment_intent.succeeded webhook
      // and easily confirm the user's payment based on the price id. For subscriptions, we can get the price id
      // in the customer.subscription.updated webhook via the line_items field.
      payment_intent_data: paymentIntentData,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function getPaymentIntentData({ mode, priceId }: { mode: StripeMode; priceId: string }):
  | {
      metadata: { priceId: string };
    }
  | undefined {
  switch (mode) {
    case 'subscription':
      return undefined;
    case 'payment':
      return { metadata: { priceId } };
    default:
      assertUnreachable(mode);
  }
}
