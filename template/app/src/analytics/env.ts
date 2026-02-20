import * as z from 'zod'

export const plausibleEnvSchema = z.object({
  PLAUSIBLE_API_KEY: z.string({ required_error: 'PLAUSIBLE_API_KEY is required for Plausible analytics' }),
  PLAUSIBLE_SITE_ID: z.string({ required_error: 'PLAUSIBLE_SITE_ID is required for Plausible analytics' }),
  PLAUSIBLE_BASE_URL: z.string({ required_error: 'PLAUSIBLE_BASE_URL is required for Plausible analytics' }),
})

export const googleAnalyticsEnvSchema = z.object({
  GOOGLE_ANALYTICS_CLIENT_EMAIL: z.string({ required_error: 'GOOGLE_ANALYTICS_CLIENT_EMAIL is required for Google Analytics' }),
  GOOGLE_ANALYTICS_PRIVATE_KEY: z.string({ required_error: 'GOOGLE_ANALYTICS_PRIVATE_KEY is required for Google Analytics' }),
  GOOGLE_ANALYTICS_PROPERTY_ID: z.string({ required_error: 'GOOGLE_ANALYTICS_PROPERTY_ID is required for Google Analytics' }),
})
