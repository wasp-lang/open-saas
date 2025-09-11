import { Subscription } from '@polar-sh/sdk/models/components/subscription.js';
import { WebhookBenefitCreatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitcreatedpayload.js';
import { WebhookBenefitGrantCreatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantcreatedpayload.js';
import { WebhookBenefitGrantCycledPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantcycledpayload.js';
import { WebhookBenefitGrantRevokedPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantrevokedpayload.js';
import { WebhookBenefitGrantUpdatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitgrantupdatedpayload.js';
import { WebhookBenefitUpdatedPayload } from '@polar-sh/sdk/models/components/webhookbenefitupdatedpayload.js';
import { WebhookCheckoutCreatedPayload } from '@polar-sh/sdk/models/components/webhookcheckoutcreatedpayload.js';
import { WebhookCheckoutUpdatedPayload } from '@polar-sh/sdk/models/components/webhookcheckoutupdatedpayload.js';
import { WebhookCustomerCreatedPayload } from '@polar-sh/sdk/models/components/webhookcustomercreatedpayload.js';
import { WebhookCustomerDeletedPayload } from '@polar-sh/sdk/models/components/webhookcustomerdeletedpayload.js';
import { WebhookCustomerStateChangedPayload } from '@polar-sh/sdk/models/components/webhookcustomerstatechangedpayload.js';
import { WebhookCustomerUpdatedPayload } from '@polar-sh/sdk/models/components/webhookcustomerupdatedpayload.js';
import { WebhookOrderCreatedPayload } from '@polar-sh/sdk/models/components/webhookordercreatedpayload.js';
import { WebhookOrderPaidPayload } from '@polar-sh/sdk/models/components/webhookorderpaidpayload.js';
import { WebhookOrderRefundedPayload } from '@polar-sh/sdk/models/components/webhookorderrefundedpayload.js';
import { WebhookOrderUpdatedPayload } from '@polar-sh/sdk/models/components/webhookorderupdatedpayload.js';
import { WebhookOrganizationUpdatedPayload } from '@polar-sh/sdk/models/components/webhookorganizationupdatedpayload.js';
import { WebhookProductCreatedPayload } from '@polar-sh/sdk/models/components/webhookproductcreatedpayload.js';
import { WebhookProductUpdatedPayload } from '@polar-sh/sdk/models/components/webhookproductupdatedpayload.js';
import { WebhookRefundCreatedPayload } from '@polar-sh/sdk/models/components/webhookrefundcreatedpayload.js';
import { WebhookRefundUpdatedPayload } from '@polar-sh/sdk/models/components/webhookrefundupdatedpayload.js';
import { WebhookSubscriptionActivePayload } from '@polar-sh/sdk/models/components/webhooksubscriptionactivepayload.js';
import { WebhookSubscriptionCanceledPayload } from '@polar-sh/sdk/models/components/webhooksubscriptioncanceledpayload.js';
import { WebhookSubscriptionCreatedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload.js';
import { WebhookSubscriptionRevokedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionrevokedpayload.js';
import { WebhookSubscriptionUncanceledPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionuncanceledpayload.js';
import { WebhookSubscriptionUpdatedPayload } from '@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload.js';
import type { SubscriptionStatus as OpenSaasSubscriptionStatus, PaymentPlanId } from '../plans';

export enum SubscriptionAction {
  CREATED = 'created',
  CANCELLED = 'cancelled',
  UNCANCELLED = 'uncancelled',
  UPDATED = 'updated',
  REVOKED = 'revoked',
  PAST_DUE = 'past_due',
  SKIP = 'skip',
}

export interface SubscriptionActionContext {
  currentPlanId: PaymentPlanId | null | undefined;
  currentStatus: OpenSaasSubscriptionStatus | null | undefined;
  newPlanId: PaymentPlanId;
  newSubscriptionStatus: OpenSaasSubscriptionStatus;
  subscription: Subscription;
}

export interface UpdateUserPaymentDetailsArgs {
  polarCustomerId?: string;
  subscriptionPlan?: PaymentPlanId;
  subscriptionStatus?: OpenSaasSubscriptionStatus | string;
  numOfCreditsPurchased?: number;
  datePaid?: Date;
}

export interface CreatePolarCheckoutSessionArgs {
  productId: string;
  customerId: string;
  mode: PolarMode;
}

export interface PolarCheckoutSession {
  id: string;
  url: string;
}

export type PolarMode = 'subscription' | 'payment';

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
