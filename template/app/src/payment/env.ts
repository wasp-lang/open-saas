import * as z from 'zod'

const paymentPlansSchema = z.object({
  PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID: z.string({ required_error: 'PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID is required' }),
  PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID: z.string({ required_error: 'PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID is required' }),
  PAYMENTS_CREDITS_10_PLAN_ID: z.string({ required_error: 'PAYMENTS_CREDITS_10_PLAN_ID is required' }),
})

export const stripeEnvSchema = paymentPlansSchema.extend({
  STRIPE_API_KEY: z.string({ required_error: 'STRIPE_API_KEY is required' }),
  STRIPE_WEBHOOK_SECRET: z.string({ required_error: 'STRIPE_WEBHOOK_SECRET is required' }),
})

export const lemonSqueezyEnvSchema = paymentPlansSchema.extend({
  LEMONSQUEEZY_API_KEY: z.string({ required_error: 'LEMONSQUEEZY_API_KEY is required' }),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string({ required_error: 'LEMONSQUEEZY_WEBHOOK_SECRET is required' }),
  LEMONSQUEEZY_STORE_ID: z.string({ required_error: 'LEMONSQUEEZY_STORE_ID is required' }),
})

export const polarEnvSchema = paymentPlansSchema.extend({
  POLAR_ORGANIZATION_ACCESS_TOKEN: z.string({ required_error: 'POLAR_ORGANIZATION_ACCESS_TOKEN is required' }),
  POLAR_SANDBOX_MODE: z.string({ required_error: 'POLAR_SANDBOX_MODE is required' }),
  POLAR_WEBHOOK_SECRET: z.string({ required_error: 'POLAR_WEBHOOK_SECRET is required' }),
})
