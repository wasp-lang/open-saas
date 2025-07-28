import { defineEnvValidationSchema } from 'wasp/env';
import { z } from 'zod';
import { PaymentProcessorId, PaymentProcessors } from '../payment/types';

const processorSchemas: Record<PaymentProcessors, object> = {
  [PaymentProcessors.Stripe]: {
    STRIPE_API_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_CUSTOMER_PORTAL_URL: z.string().url().optional(),
  },
  [PaymentProcessors.LemonSqueezy]: {
    LEMONSQUEEZY_API_KEY: z.string().optional(),
    LEMONSQUEEZY_WEBHOOK_SECRET: z.string().optional(),
    LEMONSQUEEZY_STORE_ID: z.string().optional(),
  },
};
const baseSchema = {
  PAYMENT_PROCESSOR_ID: z.nativeEnum(PaymentProcessors).default(PaymentProcessors.Stripe),
  
};
const activePaymentProcessor: PaymentProcessorId =
  (process.env.PAYMENT_PROCESSOR_ID as PaymentProcessorId) || PaymentProcessors.Stripe;
const processorSchema = processorSchemas[activePaymentProcessor];
const fullSchema = { ...baseSchema, ...processorSchema };

/**
 * Complete environment validation schema including all payment processor variables
 * Wasp will only validate the variables that are actually needed based on the processor selection
 */
export const envValidationSchema = defineEnvValidationSchema(z.object(fullSchema));
