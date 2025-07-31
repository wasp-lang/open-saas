import { z } from 'zod';
import { PaymentProcessorId, PaymentProcessors } from './types';

const processorSchemas: Record<PaymentProcessors, object> = {
  [PaymentProcessors.Stripe]: {
    STRIPE_API_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    STRIPE_CUSTOMER_PORTAL_URL: z.string().url(),
  },
  [PaymentProcessors.LemonSqueezy]: {
    LEMONSQUEEZY_API_KEY: z.string(),
    LEMONSQUEEZY_WEBHOOK_SECRET: z.string(),
    LEMONSQUEEZY_STORE_ID: z.string(),
  },
  [PaymentProcessors.Polar]: {
    /**
     * Polar API access token
     * Required for all Polar SDK operations
     */
    POLAR_ACCESS_TOKEN: z.string().min(10, 'POLAR_ACCESS_TOKEN must be at least 10 characters long'),

    /**
     * Polar organization ID
     * Required to identify your organization in Polar API calls
     */
    POLAR_ORGANIZATION_ID: z.string().min(1, 'POLAR_ORGANIZATION_ID cannot be empty'),

    /**
     * Polar webhook secret for signature verification
     * Required for secure webhook event processing
     */
    POLAR_WEBHOOK_SECRET: z
      .string()
      .min(8, 'POLAR_WEBHOOK_SECRET must be at least 8 characters long for security'),

    /**
     * Polar customer portal URL for billing management
     * Must be a valid URL where customers can manage their billing
     */
    POLAR_CUSTOMER_PORTAL_URL: z.string().url('POLAR_CUSTOMER_PORTAL_URL must be a valid URL'),

    /**
     * Optional sandbox mode override
     * When true, forces sandbox mode regardless of NODE_ENV
     */
    POLAR_SANDBOX_MODE: z.string().transform((val) => val === 'true'),
  },
};

/**
 * Get the active payment processor from environment variables
 * @param override Optional processor override for testing scenarios
 * @returns The active payment processor ID
 */
export function getActivePaymentProcessor(override?: PaymentProcessorId): PaymentProcessorId {
  if (override) {
    return override;
  }

  return (process.env.PAYMENT_PROCESSOR_ID as PaymentProcessorId) || PaymentProcessors.Stripe;
}

const activePaymentProcessor: PaymentProcessorId = getActivePaymentProcessor();
const processorSchema = processorSchemas[activePaymentProcessor];

/**
 * Payment processor validation schema for active payment processor
 */
export const paymentSchema = {
  PAYMENT_PROCESSOR_ID: z.nativeEnum(PaymentProcessors).default(PaymentProcessors.Stripe),
  PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Product ID must contain only alphanumeric characters, hyphens, and underscores'
    ),
  PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Product ID must contain only alphanumeric characters, hyphens, and underscores'
    ),
  PAYMENTS_CREDITS_10_PLAN_ID: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Product ID must contain only alphanumeric characters, hyphens, and underscores'
    ),
  WASP_WEB_CLIENT_URL: z.string().url().default('http://localhost:3000'),
  ...processorSchema,
};
