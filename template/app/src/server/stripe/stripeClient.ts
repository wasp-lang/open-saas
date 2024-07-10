import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  // NOTE:
  // API version below should ideally match the API version in your Stripe dashboard. 
  // If that is not the case, you will most likely want to (up/down)grade the `stripe` 
  // npm package to the API version that matches your Stripe dashboard's one.
  // For more details and alternative setups check 
  // https://docs.stripe.com/api/versioning .
  apiVersion: '2022-11-15',
});
