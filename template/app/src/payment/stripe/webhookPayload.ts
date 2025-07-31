import * as z from 'zod';
import { Stripe } from 'stripe';
import { UnhandledWebhookEventError } from '../errors';
import { HttpError } from 'wasp/server';

export async function parseWebhookPayload(rawStripeEvent: Stripe.Event) {
  try {
    const event = await genericStripeEventSchema.parseAsync(rawStripeEvent);
    switch (event.type) {
      case 'checkout.session.completed':
        const session = await sessionCompletedDataSchema.parseAsync(event.data.object);
        return { eventName: event.type, data: session };
      case 'invoice.paid':
        const invoice = await invoicePaidDataSchema.parseAsync(event.data.object);
        return { eventName: event.type, data: invoice };
      case 'customer.subscription.updated':
        const updatedSubscription = await subscriptionUpdatedDataSchema.parseAsync(event.data.object);
        return { eventName: event.type, data: updatedSubscription };
      case 'customer.subscription.deleted':
        const deletedSubscription = await subscriptionDeletedDataSchema.parseAsync(event.data.object);
        return { eventName: event.type, data: deletedSubscription };
      default:
        // If you'd like to handle more events, you can add more cases above.
        throw new UnhandledWebhookEventError(event.type);
    }
  } catch (e: unknown) {
    if (e instanceof UnhandledWebhookEventError) {
      throw e;
    } else {
      console.error(e);
      throw new HttpError(400, 'Error parsing Stripe event object');
    }
  }
}

/**
 * This is a subtype of
 * @type import('stripe').Stripe.Event
 */
const genericStripeEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.unknown(),
  }),
});

/**
 * This is a subtype of
 * @type import('stripe').Stripe.Checkout.Session
 */
const sessionCompletedDataSchema = z.object({
  id: z.string(),
  customer: z.string(),
  payment_status: z.enum(['paid', 'unpaid', 'no_payment_required']),
  mode: z.enum(['payment', 'subscription']),
});

/**
 * This is a subtype of
 * @type import('stripe').Stripe.Invoice
 */
const invoicePaidDataSchema = z.object({
  id: z.string(),
  customer: z.string(),
  period_start: z.number(),
  lines: z.object({
    data: z.array(
      z.object({
        pricing: z.object({ price_details: z.object({ price: z.string() }) }),
      })
    ),
  }),
});

/**
 * This is a subtype of
 * @type import('stripe').Stripe.Subscription
 */
const subscriptionUpdatedDataSchema = z.object({
  customer: z.string(),
  status: z.string(),
  cancel_at_period_end: z.boolean(),
  items: z.object({
    data: z.array(
      z.object({
        price: z.object({
          id: z.string(),
        }),
      })
    ),
  }),
});

/**
 * This is a subtype of
 * @type import('stripe').Stripe.Subscription
 */
const subscriptionDeletedDataSchema = z.object({
  customer: z.string(),
});

export type SessionCompletedData = z.infer<typeof sessionCompletedDataSchema>;

export type InvoicePaidData = z.infer<typeof invoicePaidDataSchema>;

export type SubscriptionUpdatedData = z.infer<typeof subscriptionUpdatedDataSchema>;

export type SubscriptionDeletedData = z.infer<typeof subscriptionDeletedDataSchema>;
