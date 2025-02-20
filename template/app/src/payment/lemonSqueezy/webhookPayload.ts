import * as z from 'zod';
import { UnhandledWebhookEventError } from '../errors';

export async function parseWebhookPayload(rawPayload: string) {
  const rawEvent = JSON.parse(rawPayload) as unknown;
  const event = await genericEventSchema.parseAsync(rawEvent).catch((e) => {
    console.error(e);
    throw new Error('Invalid Lemon Squeezy Webhook Event');
  });
  switch (event.meta.event_name) {
    case 'order_created':
      const orderData = await orderDataSchema.parseAsync(event.data).catch((e) => {
        console.error(e);
        throw new Error('Invalid Lemon Squeezy Order Event');
      });
      return { eventName: event.meta.event_name, meta: event.meta, data: orderData };
    case 'subscription_created':
    case 'subscription_updated':
    case 'subscription_cancelled':
    case 'subscription_expired':
      const subscriptionData = await subscriptionDataSchema.parseAsync(event.data).catch((e) => {
        console.error(e);
        throw new Error('Invalid Lemon Squeezy Subscription Event');
      });
      return { eventName: event.meta.event_name, meta: event.meta, data: subscriptionData };
    default:
      // If you'd like to handle more events, you can add more cases above.
      throw new UnhandledWebhookEventError(event.meta.event_name);
  }
}

export type SubscriptionData = z.infer<typeof subscriptionDataSchema>;

export type OrderData = z.infer<typeof orderDataSchema>;

const genericEventSchema = z.object({
  meta: z.object({
    event_name: z.string(),
    custom_data: z.object({
      user_id: z.string(),
    }),
  }),
  data: z.unknown(),
});

const orderDataSchema = z.object({
  attributes: z.object({
    customer_id: z.number(),
    status: z.string(),
    first_order_item: z.object({
      variant_id: z.number(),
    }),
    order_number: z.string(),
  }),
});

const subscriptionDataSchema = z.object({
  attributes: z.object({
    customer_id: z.number(),
    status: z.string(),
    variant_id: z.number(),
  }),
});
