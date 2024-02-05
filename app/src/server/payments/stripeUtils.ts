import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2022-11-15',
});

// WASP_WEB_CLIENT_URL will be set up by Wasp when deploying to production: https://wasp-lang.dev/docs/deploying
const DOMAIN = process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000';

export async function fetchStripeCustomer(customerEmail: string) {
  let customer: Stripe.Customer;
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
}

export async function createStripeCheckoutSession({ priceId, customerId }: { priceId: string; customerId: string }) {
  return await stripe.checkout.sessions.create({
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${DOMAIN}/checkout?success=true`,
    cancel_url: `${DOMAIN}/checkout?canceled=true`,
    automatic_tax: { enabled: true },
    customer_update: {
      address: 'auto',
    },
    customer: customerId,
  });
}
