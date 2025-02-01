import Stripe from 'stripe';
import { requireNodeEnvVar } from '../../server/utils';

export const stripe = new Stripe(requireNodeEnvVar('STRIPE_API_KEY'), {
  // NOTE:
  // API version below should ideally match the API version in your Stripe dashboard.
  // If that is not the case, you will most likely want to (up/down)grade the `stripe`
  // npm package to the API version  that matches your Stripe dashboard's one.
  // This can be found in package.json, e.g. "stripe": "17.2.0"
  // The latest version is always listed here: https://www.npmjs.com/package/stripe
  // For more details and alternative setups check
  // https://docs.stripe.com/api/versioning .
  apiVersion: '2024-09-30.acacia',
});
