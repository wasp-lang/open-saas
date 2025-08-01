import type { PaymentPlanEffect } from '../plans';
import type { CreateCheckoutSessionArgs, FetchCustomerPortalUrlArgs, PaymentProcessor } from '../paymentProcessor'
import { fetchStripeCustomer, createStripeCheckoutSession } from './checkoutUtils';
import { requireNodeEnvVar } from '../../server/utils';
import { stripeWebhook, stripeMiddlewareConfigFn } from './webhook';
import Stripe from 'stripe';
import { stripe } from './stripeClient';
import { PaymentProcessors } from '../types';

export type StripeMode = 'subscription' | 'payment';

/**
 * Calculates total revenue from Stripe transactions
 * @returns Promise resolving to total revenue in dollars
 */
async function fetchTotalStripeRevenue(): Promise<number> {
  let totalRevenue = 0;
  let params: Stripe.BalanceTransactionListParams = {
    limit: 100,
    // created: {
    //   gte: startTimestamp,
    //   lt: endTimestamp
    // },
    type: 'charge',
  };

  let hasMore = true;
  while (hasMore) {
    const balanceTransactions = await stripe.balanceTransactions.list(params);

    for (const transaction of balanceTransactions.data) {
      if (transaction.type === 'charge') {
        totalRevenue += transaction.amount;
      }
    }

    if (balanceTransactions.has_more) {
      // Set the starting point for the next iteration to the last object fetched
      params.starting_after = balanceTransactions.data[balanceTransactions.data.length - 1].id;
    } else {
      hasMore = false;
    }
  }

  // Revenue is in cents so we convert to dollars (or your main currency unit)
  return totalRevenue / 100;
}

export const stripePaymentProcessor: PaymentProcessor = {
  id: PaymentProcessors.Stripe,
  createCheckoutSession: async ({ userId, userEmail, paymentPlan, prismaUserDelegate }: CreateCheckoutSessionArgs) => {
    const customer = await fetchStripeCustomer(userEmail);
    const stripeSession = await createStripeCheckoutSession({
      priceId: paymentPlan.getPaymentProcessorPlanId(),
      customerId: customer.id,
      mode: paymentPlanEffectToStripeMode(paymentPlan.effect),
    });
    await prismaUserDelegate.update({
      where: {
        id: userId
      },
      data: {
        paymentProcessorUserId: customer.id
      }
    })
    if (!stripeSession.url) throw new Error('Error creating Stripe Checkout Session');
    const session = {
      url: stripeSession.url,
      id: stripeSession.id,
    };
    return { session };
  },
  fetchCustomerPortalUrl: async (_args: FetchCustomerPortalUrlArgs) =>
    requireNodeEnvVar('STRIPE_CUSTOMER_PORTAL_URL'),
  getTotalRevenue: fetchTotalStripeRevenue,
  webhook: stripeWebhook,
  webhookMiddlewareConfigFn: stripeMiddlewareConfigFn,
};

function paymentPlanEffectToStripeMode(planEffect: PaymentPlanEffect): StripeMode {
  const effectToMode: Record<PaymentPlanEffect['kind'], StripeMode> = {
    subscription: 'subscription',
    credits: 'payment',
  };
  return effectToMode[planEffect.kind];
}
