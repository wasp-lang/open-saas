/**
 * Polar Payment Processor TypeScript Type Definitions
 *
 * This module defines all TypeScript types, interfaces, and enums
 * used throughout the Polar payment processor integration.
 */

// @ts-ignore
import { WebhookBenefitCreatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitcreatedpayload.js';
// @ts-ignore
import { WebhookBenefitGrantCreatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantcreatedpayload.js';
// @ts-ignore
import { WebhookBenefitGrantCycledPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantcycledpayload.js';
// @ts-ignore
import { WebhookBenefitGrantRevokedPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantrevokedpayload.js';
// @ts-ignore
import { WebhookBenefitGrantUpdatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantupdatedpayload.js';
// @ts-ignore
import { WebhookBenefitUpdatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitupdatedpayload.js';
// @ts-ignore
import { WebhookCheckoutCreatedPayload } from '@polar-sh/sdk/models/components/webhookcheckoutcreatedpayload.js';
// @ts-ignore
import { WebhookCheckoutUpdatedPayload } from '@polar-sh/sdk/models/components/webhookcheckoutupdatedpayload.js';
// @ts-ignore
import { WebhookCustomerCreatedPayload } from '@polar-sh/sdk/models/components/webhookcustomercreatedpayload.js';
// @ts-ignore
import { WebhookCustomerDeletedPayload } from '@polar-sh/sdk/models/components/webhookcustomerdeletedpayload.js';
// @ts-ignore
import { WebhookCustomerStateChangedPayload } from '@polar-sh/sdk/models/components/webhookcustomerstatechangedpayload.js';
// @ts-ignore
import { WebhookCustomerUpdatedPayload } from '@polar-sh/sdk/models/components/webhookcustomerupdatedpayload.js';
// @ts-ignore
import { WebhookOrderCreatedPayload } from '@polar-sh/sdk/models/components/webhookordercreatedpayload.js';
// @ts-ignore
import { WebhookOrderPaidPayload } from '@polar-sh/sdk/models/components/webhookorderpaidpayload.js';
// @ts-ignore
import { WebhookOrderRefundedPayload } from '@polar-sh/sdk/models/components/webhookorderrefundedpayload.js';
// @ts-ignore
import { WebhookOrderUpdatedPayload } from '@polar-sh/sdk/models/components/webhookorderupdatedpayload.js';
// @ts-ignore
import { WebhookOrganizationUpdatedPayload } from '@polar-sh/sdk/models/components/webhookorganizationupdatedpayload.js';
// @ts-ignore
import { WebhookProductCreatedPayload } from '@polar-sh/sdk/models/components/webhookproductcreatedpayload.js';
// @ts-ignore
import { WebhookProductUpdatedPayload } from '@polar-sh/sdk/models/components/webhookproductupdatedpayload.js';
// @ts-ignore
import { WebhookRefundCreatedPayload } from '@polar-sh/sdk/models/components/webhookrefundcreatedpayload.js';
// @ts-ignore
import { WebhookRefundUpdatedPayload } from '@polar-sh/sdk/models/components/webhookrefundupdatedpayload.js';
// @ts-ignore
import { WebhookSubscriptionActivePayload } from '@polar-sh/sdk/models/components/webhooksubscriptionactivepayload.js';
// @ts-ignore
import { WebhookSubscriptionCanceledPayload } from '@polar-sh/sdk/models/components/webhooksubscriptioncanceledpayload.js';
// @ts-ignore
import { WebhookSubscriptionCreatedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload.js';
// @ts-ignore
import { WebhookSubscriptionRevokedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionrevokedpayload.js';
// @ts-ignore
import { WebhookSubscriptionUncanceledPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionuncanceledpayload.js';
// @ts-ignore
import { WebhookSubscriptionUpdatedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload.js';

// ================================
// POLAR SDK TYPES
// ================================

/**
 * Polar SDK server environment options
 */
export type PolarServerEnvironment = 'sandbox' | 'production';

/**
 * Polar payment modes supported by the integration
 */
export type PolarMode = 'subscription' | 'payment';

// ================================
// POLAR WEBHOOK PAYLOAD TYPES
// ================================

/**
 * Polar webhook payload types
 */
export type PolarWebhookPayload =
  | WebhookCheckoutCreatedPayload
  | WebhookBenefitCreatedPayload
  | WebhookBenefitGrantCreatedPayload
  | WebhookBenefitGrantRevokedPayload
  | WebhookBenefitGrantUpdatedPayload
  | WebhookBenefitGrantCycledPayload
  | WebhookBenefitUpdatedPayload
  | WebhookCheckoutUpdatedPayload
  | WebhookOrderCreatedPayload
  | WebhookOrderRefundedPayload
  | WebhookOrderUpdatedPayload
  | WebhookOrderPaidPayload
  | WebhookOrganizationUpdatedPayload
  | WebhookProductCreatedPayload
  | WebhookProductUpdatedPayload
  | WebhookRefundCreatedPayload
  | WebhookRefundUpdatedPayload
  | WebhookSubscriptionActivePayload
  | WebhookSubscriptionCanceledPayload
  | WebhookSubscriptionCreatedPayload
  | WebhookSubscriptionRevokedPayload
  | WebhookSubscriptionUncanceledPayload
  | WebhookSubscriptionUpdatedPayload
  | WebhookCustomerCreatedPayload
  | WebhookCustomerUpdatedPayload
  | WebhookCustomerDeletedPayload
  | WebhookCustomerStateChangedPayload;
/**
 * Base metadata structure attached to Polar checkout sessions
 */
export interface PolarCheckoutMetadata {
  /** Internal user ID from our system */
  userId: string;
  /** Payment mode: subscription or one-time payment */
  mode: PolarMode;
  /** Additional custom metadata */
  [key: string]: string | undefined;
}

/**
 * Common structure for Polar webhook payloads
 */
export interface BasePolarWebhookPayload {
  /** Polar event ID */
  id: string;
  /** Polar customer ID */
  customerId?: string;
  /** Alternative customer ID field name */
  customer_id?: string;
  /** Polar product ID */
  productId?: string;
  /** Alternative product ID field name */
  product_id?: string;
  /** Event creation timestamp */
  createdAt?: string;
  /** Alternative creation timestamp field name */
  created_at?: string;
  /** Custom metadata attached to the event */
  metadata?: PolarCheckoutMetadata;
}

/**
 * Polar checkout created webhook payload
 */
export interface PolarCheckoutCreatedPayload extends BasePolarWebhookPayload {
  /** Checkout session URL */
  url?: string;
  /** Checkout session status */
  status?: string;
}

/**
 * Polar order created webhook payload (for one-time payments/credits)
 */
export interface PolarOrderCreatedPayload extends BasePolarWebhookPayload {
  /** Order total amount */
  amount?: number;
  /** Order currency */
  currency?: string;
  /** Order line items */
  items?: Array<{
    productId: string;
    quantity: number;
    amount: number;
  }>;
}

/**
 * Polar subscription webhook payload
 */
export interface PolarSubscriptionPayload extends BasePolarWebhookPayload {
  /** Subscription status */
  status: string;
  /** Subscription start date */
  startedAt?: string;
  /** Subscription end date */
  endsAt?: string;
  /** Subscription cancellation date */
  canceledAt?: string;
}

// ================================
// CHECKOUT SESSION TYPES
// ================================

/**
 * Arguments for creating a Polar checkout session
 */
export interface CreatePolarCheckoutSessionArgs {
  /** Polar product ID */
  productId: string;
  /** Customer email address */
  userEmail: string;
  /** Internal user ID */
  userId: string;
  /** Payment mode (subscription or one-time payment) */
  mode: PolarMode;
}

/**
 * Result of creating a Polar checkout session
 */
export interface PolarCheckoutSession {
  /** Checkout session ID */
  id: string;
  /** Checkout session URL */
  url: string;
  /** Associated customer ID (if available) */
  customerId?: string;
}

// ================================
// CUSTOMER MANAGEMENT TYPES
// ================================

/**
 * Polar customer information
 */
export interface PolarCustomer {
  /** Polar customer ID */
  id: string;
  /** Customer email address */
  email: string;
  /** Customer name */
  name?: string;
  /** Customer creation timestamp */
  createdAt: string;
  /** Additional customer metadata */
  metadata?: Record<string, string>;
}

// ================================
// SUBSCRIPTION STATUS MAPPING
// ================================

/**
 * Polar subscription status values
 */
export enum PolarSubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  EXPIRED = 'expired',
  INCOMPLETE = 'incomplete',
  TRIALING = 'trialing',
}

/**
 * Mapping from Polar subscription statuses to OpenSaaS statuses
 */
export type PolarToOpenSaaSStatusMap = {
  [PolarSubscriptionStatus.ACTIVE]: 'active';
  [PolarSubscriptionStatus.CANCELLED]: 'cancelled';
  [PolarSubscriptionStatus.PAST_DUE]: 'past_due';
  [PolarSubscriptionStatus.EXPIRED]: 'cancelled';
  [PolarSubscriptionStatus.INCOMPLETE]: 'pending';
  [PolarSubscriptionStatus.TRIALING]: 'active';
};

// ================================
// ERROR TYPES
// ================================

/**
 * Polar-specific error types
 */
export class PolarConfigurationError extends Error {
  constructor(message: string) {
    super(`Polar Configuration Error: ${message}`);
    this.name = 'PolarConfigurationError';
  }
}

export class PolarApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(`Polar API Error: ${message}`);
    this.name = 'PolarApiError';
  }
}

export class PolarWebhookError extends Error {
  constructor(
    message: string,
    public webhookEvent?: string
  ) {
    super(`Polar Webhook Error: ${message}`);
    this.name = 'PolarWebhookError';
  }
}

// ================================
// UTILITY TYPES
// ================================

/**
 * Type guard to check if a value is a valid Polar mode
 */
export function isPolarMode(value: string): value is PolarMode {
  return value === 'subscription' || value === 'payment';
}

/**
 * Type guard to check if a value is a valid Polar subscription status
 */
export function isPolarSubscriptionStatus(value: string): value is PolarSubscriptionStatus {
  return Object.values(PolarSubscriptionStatus).includes(value as PolarSubscriptionStatus);
}

/**
 * Type for validating webhook payload structure
 */
export type WebhookPayloadValidator<T extends BasePolarWebhookPayload> = (payload: unknown) => payload is T;

// ================================
// CONFIGURATION VALIDATION TYPES
// ================================

/**
 * Environment variable validation result
 */
export interface EnvVarValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Missing required variables */
  missingVars: string[];
  /** Invalid variable values */
  invalidVars: Array<{ name: string; value: string; reason: string }>;
}

/**
 * Polar configuration validation options
 */
export interface PolarConfigValidationOptions {
  /** Whether to throw errors on validation failure */
  throwOnError: boolean;
  /** Whether to validate optional variables */
  validateOptional: boolean;
  /** Whether to check environment-specific requirements */
  checkEnvironmentRequirements: boolean;
}
