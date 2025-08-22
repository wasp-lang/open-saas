// @ts-ignore
import { OrderStatus } from '@polar-sh/sdk/models/components/orderstatus.js';
// @ts-ignore
import { SubscriptionStatus } from '@polar-sh/sdk/models/components/subscriptionstatus.js';
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
import { HttpError } from 'wasp/server';
import * as z from 'zod';
import { UnhandledWebhookEventError } from '../errors';

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

export type ParsedWebhookPayload =
  | { eventName: 'order.paid'; data: OrderData }
  | { eventName: 'subscription.created'; data: SubscriptionData }
  | { eventName: 'subscription.updated'; data: SubscriptionData }
  | { eventName: 'subscription.canceled'; data: SubscriptionData }
  | { eventName: 'subscription.active'; data: SubscriptionData };

export async function parseWebhookPayload(rawEvent: PolarWebhookPayload): Promise<ParsedWebhookPayload> {
  try {
    switch (rawEvent.type) {
      case 'order.paid': {
        const orderData = await orderDataSchema.parseAsync(rawEvent.data);

        return { eventName: rawEvent.type, data: orderData };
      }
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.canceled':
      case 'subscription.active': {
        const subscriptionData = await subscriptionDataSchema.parseAsync(rawEvent.data);

        return { eventName: rawEvent.type, data: subscriptionData };
      }
      default:
        // If you'd like to handle more events, you can add more cases above.
        throw new UnhandledWebhookEventError(rawEvent.type);
    }
  } catch (e: unknown) {
    if (e instanceof UnhandledWebhookEventError) {
      throw e;
    } else {
      console.error(e);
      throw new HttpError(400, 'Error parsing Polar webhook payload');
    }
  }
}

const orderDataSchema = z.object({
  id: z.string(),
  customerId: z.string().optional(),
  productId: z.string().optional(),
  status: z.enum(Object.values(OrderStatus) as [string, ...string[]]),
  totalAmount: z.number(),
  createdAt: z.date(),
  customer: z.object({
    id: z.string(),
    externalId: z.string(),
    email: z.string(),
    name: z.string().optional(),
  }),
  metadata: z
    .object({
      source: z.string().optional(),
      paymentMode: z.string().optional(),
    })
    .optional(),
});

const subscriptionDataSchema = z.object({
  id: z.string(),
  customerId: z.string().optional(),
  productId: z.string().optional(),
  status: z.enum(Object.values(SubscriptionStatus) as [string, ...string[]]),
  createdAt: z.date(),
  customer: z.object({
    id: z.string(),
    externalId: z.string(),
    email: z.string(),
    name: z.string().optional(),
  }),
  metadata: z
    .object({
      source: z.string().optional(),
      paymentMode: z.string().optional(),
    })
    .optional(),
});

export type OrderData = z.infer<typeof orderDataSchema>;
export type SubscriptionData = z.infer<typeof subscriptionDataSchema>;
