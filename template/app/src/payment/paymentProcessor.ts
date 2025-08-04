import type { PaymentPlan } from './plans';
import type { PaymentsWebhook } from 'wasp/server/api';
import type { MiddlewareConfigFn } from 'wasp/server';
import { PrismaClient } from '@prisma/client';
import { stripePaymentProcessor } from './stripe/paymentProcessor';
import { lemonSqueezyPaymentProcessor } from './lemonSqueezy/paymentProcessor';
import { paddlePaymentProcessor } from './paddle/paymentProcessor';

export interface CreateCheckoutSessionArgs {
  userId: string;
  userEmail: string;
  paymentPlan: PaymentPlan;
  prismaUserDelegate: PrismaClient['user'];
}
export interface FetchCustomerPortalUrlArgs { 
  userId: string; 
  prismaUserDelegate: PrismaClient['user']; 
};

export interface PaymentProcessor {
  id: 'stripe' | 'lemonsqueezy' | 'paddle';
  createCheckoutSession: (args: CreateCheckoutSessionArgs) => Promise<{ session: { id: string; url: string }; }>; 
  fetchCustomerPortalUrl: (args: FetchCustomerPortalUrlArgs) => Promise<string | null>;
  webhook: PaymentsWebhook;
  webhookMiddlewareConfigFn: MiddlewareConfigFn;
}

/**
 * Choose which payment processor you'd like to use by setting the PAYMENT_PROCESSOR environment variable.
 * Valid options: 'stripe', 'lemonsqueezy', 'paddle'
 * Defaults to 'stripe' if not set.
 */
function getPaymentProcessor(): PaymentProcessor {
  const processorType = process.env.PAYMENT_PROCESSOR || 'stripe';
  
  switch (processorType) {
    case 'stripe':
      return stripePaymentProcessor;
    case 'lemonsqueezy':
      return lemonSqueezyPaymentProcessor;
    case 'paddle':
      return paddlePaymentProcessor;
    default:
      console.warn(`Unknown payment processor: ${processorType}. Defaulting to Stripe.`);
      return stripePaymentProcessor;
  }
}

export const paymentProcessor: PaymentProcessor = getPaymentProcessor();
