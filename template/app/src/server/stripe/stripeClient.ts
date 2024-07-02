import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  // Note: make sure this version matches the API version in your Stripe dashboard.
  // You can do by specificing the same version in the developer tab of your Stripe Dashboard 
  // or upgrading your Stripe SDK to match the version specified in your Stripe Dashboard.
  apiVersion: '2022-11-15',
});
