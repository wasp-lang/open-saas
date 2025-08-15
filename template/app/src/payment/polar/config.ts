import { PaymentPlanId, parsePaymentPlanId } from '../plans';
import { env } from 'wasp/server';

/**
 * Core Polar API configuration environment variables
 * Used throughout the Polar integration for SDK initialization and webhook processing
 */
export interface PolarApiConfig {
  /** Polar API access token (required) - obtain from Polar dashboard */
  readonly accessToken: string;
  /** Polar organization ID (required) - found in organization settings */
  readonly organizationId: string;
  /** Webhook secret for signature verification (required) - generated when setting up webhooks */
  readonly webhookSecret: string;
  /** Customer portal URL for subscription management (required) - provided by Polar */
  readonly customerPortalUrl: string;
  /** Optional sandbox mode override (defaults to NODE_ENV-based detection) */
  readonly sandboxMode?: boolean;
}

/**
 * Polar product/plan ID mappings for OpenSaaS plans
 * Maps internal plan identifiers to Polar product IDs
 */
export interface PolarPlanConfig {
  /** Polar product ID for hobby subscription plan */
  readonly hobbySubscriptionPlanId: string;
  /** Polar product ID for pro subscription plan */
  readonly proSubscriptionPlanId: string;
  /** Polar product ID for 10 credits plan */
  readonly credits10PlanId: string;
}

/**
 * Complete Polar configuration combining API and plan settings
 */
export interface PolarConfig {
  readonly api: PolarApiConfig;
  readonly plans: PolarPlanConfig;
}

/**
 * All Polar-related environment variables
 * Used for validation and configuration loading
 */
export const POLAR_ENV_VARS = {
  // Core API Configuration
  POLAR_ACCESS_TOKEN: 'POLAR_ACCESS_TOKEN',
  POLAR_ORGANIZATION_ID: 'POLAR_ORGANIZATION_ID',
  POLAR_WEBHOOK_SECRET: 'POLAR_WEBHOOK_SECRET',
  POLAR_CUSTOMER_PORTAL_URL: 'POLAR_CUSTOMER_PORTAL_URL',
  POLAR_SANDBOX_MODE: 'POLAR_SANDBOX_MODE',
} as const;

/**
 * Gets the complete Polar configuration from environment variables
 * @returns Complete Polar configuration object
 * @throws Error if any required variables are missing or invalid
 */
export function getPolarConfig(): PolarConfig {
  return {
    api: getPolarApiConfig(),
    plans: getPolarPlanConfig(),
  };
}

/**
 * Gets Polar API configuration from environment variables
 * @returns Polar API configuration object
 * @throws Error if any required API variables are missing
 */
export function getPolarApiConfig(): PolarApiConfig {
  return {
    accessToken: process.env[POLAR_ENV_VARS.POLAR_ACCESS_TOKEN]!,
    organizationId: process.env[POLAR_ENV_VARS.POLAR_ORGANIZATION_ID]!,
    webhookSecret: process.env[POLAR_ENV_VARS.POLAR_WEBHOOK_SECRET]!,
    customerPortalUrl: process.env[POLAR_ENV_VARS.POLAR_CUSTOMER_PORTAL_URL]!,
    sandboxMode: shouldUseSandboxMode(),
  };
}

/**
 * Gets Polar plan configuration from environment variables
 * @returns Polar plan configuration object
 * @throws Error if any required plan variables are missing
 */
export function getPolarPlanConfig(): PolarPlanConfig {
  return {
    hobbySubscriptionPlanId: env.PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID,
    proSubscriptionPlanId: env.PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID,
    credits10PlanId: env.PAYMENTS_CREDITS_10_PLAN_ID,
  };
}

/**
 * Determines if Polar should use sandbox mode
 * Checks POLAR_SANDBOX_MODE environment variable first, then falls back to NODE_ENV
 * @returns true if sandbox mode should be used, false for production mode
 */
export function shouldUseSandboxMode(): boolean {
  const explicitSandboxMode = process.env.POLAR_SANDBOX_MODE;
  if (explicitSandboxMode !== undefined) {
    return explicitSandboxMode === 'true';
  }
  
  return env.NODE_ENV !== 'production';
}

/**
 * Maps a Polar product ID to an OpenSaaS plan ID
 * @param polarProductId The Polar product ID to map
 * @returns The corresponding OpenSaaS PaymentPlanId
 * @throws Error if the product ID is not found
 */
export function mapPolarProductIdToPlanId(polarProductId: string): PaymentPlanId {
  const planConfig = getPolarPlanConfig();
  
  const planMapping: Record<string, PaymentPlanId> = {
    [planConfig.hobbySubscriptionPlanId]: PaymentPlanId.Hobby,
    [planConfig.proSubscriptionPlanId]: PaymentPlanId.Pro,
    [planConfig.credits10PlanId]: PaymentPlanId.Credits10,
  };
  
  const planId = planMapping[polarProductId];
  if (!planId) {
    throw new Error(`Unknown Polar product ID: ${polarProductId}`);
  }
  
  return planId;
}

/**
 * Gets a Polar product ID for a given OpenSaaS plan ID
 * @param planId The OpenSaaS plan ID (string or PaymentPlanId enum)
 * @returns The corresponding Polar product ID
 * @throws Error if the plan ID is not found or invalid
 */
export function getPolarProductIdForPlan(planId: string | PaymentPlanId): string {
  const validatedPlanId = typeof planId === 'string' ? parsePaymentPlanId(planId) : planId;
  
  const planConfig = getPolarPlanConfig();
  
  const productMapping: Record<PaymentPlanId, string> = {
    [PaymentPlanId.Hobby]: planConfig.hobbySubscriptionPlanId,
    [PaymentPlanId.Pro]: planConfig.proSubscriptionPlanId,
    [PaymentPlanId.Credits10]: planConfig.credits10PlanId,
  };
  
  const productId = productMapping[validatedPlanId];
  if (!productId) {
    throw new Error(`Unknown plan ID: ${validatedPlanId}`);
  }
  
  return productId;
} 