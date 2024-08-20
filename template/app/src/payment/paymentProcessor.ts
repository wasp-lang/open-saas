import type { PaymentPlan } from './plans';
import { PrismaClient } from '@prisma/client';
import { stripePaymentProcessor } from './stripe/paymentProcessor';
import { lemonSqueezyPaymentProcessor } from './lemonSqueezy/paymentProcessor';

export interface CreateCheckoutSessionArgs { userId: string | undefined; userEmail: string; paymentPlan: PaymentPlan }
export interface FetchCustomerPortalUrlArgs { userId: string; prismaUserDelegate: PrismaClient['user'] };

interface PaymentProcessor {
  createCheckoutSession: ({ userId, userEmail, paymentPlan }: CreateCheckoutSessionArgs) => Promise<{ session: { id: string; url: string }; customer?: { id: string } }>;
  fetchCustomerPortalUrl: (args?: FetchCustomerPortalUrlArgs) => Promise<string>;
}

export const paymentProcessor: PaymentProcessor = lemonSqueezyPaymentProcessor;
