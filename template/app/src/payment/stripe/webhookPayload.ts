import * as z from 'zod';
import { Stripe } from 'stripe';
import { UnhandledWebhookEventError } from '../errors';

export async function parseWebhookPayload(rawStripeEvent: Stripe.Event) {
  const event = await genericStripeEventSchema.parseAsync(rawStripeEvent).catch((e) => {
    console.error(e);
    throw new Error('Invalid Stripe Event');
  });
  switch (event.type) {
    case 'checkout.session.completed':
      const session = await sessionCompletedDataSchema.parseAsync(event.data.object).catch((e) => {
        console.error(e);
        throw new Error('Error parsing Stripe event object');
      });
      return { eventName: event.type, data: session };
    case 'invoice.paid':
      const invoice = await invoicePaidDataSchema.parseAsync(event.data.object).catch((e) => {
        console.error(e);
        throw new Error('Error parsing Stripe event object');
      });
      return { eventName: event.type, data: invoice };
    case 'customer.subscription.updated':
      const updatedSubscription = await subscriptionUpdatedDataSchema
        .parseAsync(event.data.object)
        .catch((e) => {
          console.error(e);
          throw new Error('Error parsing Stripe event object');
        });
      return { eventName: event.type, data: updatedSubscription };
    case 'customer.subscription.deleted':
      const deletedSubscription = await subscriptionDeletedDataSchema
        .parseAsync(event.data.object)
        .catch((e) => {
          console.error(e);
          throw new Error('Error parsing Stripe event object');
        });
      return { eventName: event.type, data: deletedSubscription };
    default:
      // If you'd like to handle more events, you can add more cases above.
      throw new UnhandledWebhookEventError(event.type);
  }
}

const genericStripeEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.unknown(),
  }),
});

const sessionCompletedDataSchema = z.object({
  id: z.string(),
  customer: z.string(),
});

const invoicePaidDataSchema = z.object({
  customer: z.string(),
  period_start: z.number(),
});

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

const subscriptionDeletedDataSchema = z.object({
  customer: z.string(),
});

export type SessionCompletedData = z.infer<typeof sessionCompletedDataSchema>;

export type InvoicePaidData = z.infer<typeof invoicePaidDataSchema>;

export type SubscriptionUpdatedData = z.infer<typeof subscriptionUpdatedDataSchema>;

export type SubscriptionDeletedData = z.infer<typeof subscriptionDeletedDataSchema>;
