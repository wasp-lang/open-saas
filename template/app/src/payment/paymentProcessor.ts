import type { PaymentPlan } from './plans';
import type { PaymentsWebhook } from 'wasp/server/api';
import type { MiddlewareConfigFn } from 'wasp/server';
import { PrismaClient } from '@prisma/client';
import { stripePaymentProcessor } from './stripe/paymentProcessor';
// import { lemonSqueezyPaymentProcessor } from './lemonSqueezy/paymentProcessor';
// import { polarPaymentProcessor } from './polar/paymentProcessor';

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
  id: 'stripe' | 'lemonsqueezy' | 'polar';
  createCheckoutSession: (args: CreateCheckoutSessionArgs) => Promise<{ session: { id: string; url: string }; }>; 
  fetchCustomerPortalUrl: (args: FetchCustomerPortalUrlArgs) => Promise<string | null>;
  getTotalRevenue: () => Promise<number>;
  webhook: PaymentsWebhook;
  webhookMiddlewareConfigFn: MiddlewareConfigFn;
}

export const paymentProcessor: PaymentProcessor = stripePaymentProcessor;
