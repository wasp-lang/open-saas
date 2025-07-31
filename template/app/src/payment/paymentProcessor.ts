import type { PaymentPlan } from './plans';
import type { PaymentsWebhook } from 'wasp/server/api';
import type { MiddlewareConfigFn } from 'wasp/server';
import { PrismaClient } from '@prisma/client';
import { stripePaymentProcessor } from './stripe/paymentProcessor';
import { lemonSqueezyPaymentProcessor } from './lemonSqueezy/paymentProcessor';
import { polarPaymentProcessor } from './polar/paymentProcessor';
import { PaymentProcessorId, PaymentProcessors } from './types';
import { getActivePaymentProcessor } from './validation';

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

/**
 * Standard interface for all payment processors
 * Provides a consistent API for payment operations across different providers
 */
export interface PaymentProcessor {
  id: PaymentProcessorId;
  /**
   * Creates a checkout session for payment processing
   * Handles both subscription and one-time payment flows based on the payment plan configuration
   * @param args Checkout session creation arguments
   * @param args.userId Internal user ID for tracking and database updates
   * @param args.userEmail Customer email address for payment processor customer creation/lookup
   * @param args.paymentPlan Payment plan configuration containing pricing and payment type information
   * @param args.prismaUserDelegate Prisma user delegate for database operations
   * @returns Promise resolving to checkout session with session ID and redirect URL
   * @throws {Error} When payment processor API calls fail or required configuration is missing
   * @example
   * ```typescript
   * const { session } = await paymentProcessor.createCheckoutSession({
   *   userId: 'user_123',
   *   userEmail: 'customer@example.com',
   *   paymentPlan: hobbyPlan,
   *   prismaUserDelegate: context.entities.User
   * });
   * // Redirect user to session.url for payment
   * ```
   */
  createCheckoutSession: (args: CreateCheckoutSessionArgs) => Promise<{ session: { id: string; url: string }; }>; 
  /**
   * Retrieves the customer portal URL for subscription and billing management
   * Allows customers to view billing history, update payment methods, and manage subscriptions
   * @param args Customer portal URL retrieval arguments
   * @param args.userId Internal user ID to lookup customer information
   * @param args.prismaUserDelegate Prisma user delegate for database operations
   * @returns Promise resolving to customer portal URL or null if not available
   * @throws {Error} When user lookup fails or payment processor API calls fail
   * @example
   * ```typescript
   * const portalUrl = await paymentProcessor.fetchCustomerPortalUrl({
   *   userId: 'user_123',
   *   prismaUserDelegate: context.entities.User
   * });
   * if (portalUrl) {
   *   // Redirect user to portal for billing management
   *   return { redirectUrl: portalUrl };
   * }
   * ```
   */
  fetchCustomerPortalUrl: (args: FetchCustomerPortalUrlArgs) => Promise<string | null>;
  /**
   * Calculates the total revenue from this payment processor
   * @returns Promise resolving to total revenue in dollars
   */
  getTotalRevenue: () => Promise<number>;
  webhook: PaymentsWebhook;
  webhookMiddlewareConfigFn: MiddlewareConfigFn;
}

/**
 * All available payment processors
 */
const paymentProcessorMap: Record<PaymentProcessors, PaymentProcessor> = {
  [PaymentProcessors.Stripe]: stripePaymentProcessor,
  [PaymentProcessors.LemonSqueezy]: lemonSqueezyPaymentProcessor,
  [PaymentProcessors.Polar]: polarPaymentProcessor,
};

/**
 * Get the payment processor instance based on environment configuration or override
 * @param override Optional processor override for testing scenarios
 * @returns The configured payment processor instance
 * @throws {Error} When the specified processor is not found in the processor map
 */
export function getPaymentProcessor(override?: PaymentProcessorId): PaymentProcessor {
  const processorId = getActivePaymentProcessor(override);
  const processor = paymentProcessorMap[processorId];
  
  if (!processor) {
    throw new Error(`Payment processor '${processorId}' not found. Available processors: ${Object.keys(paymentProcessorMap).join(', ')}`);
  }
  
  return processor;
}

/**
 * The currently configured payment processor.
 */
export const paymentProcessor: PaymentProcessor = getPaymentProcessor();
