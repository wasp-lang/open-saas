import { PrismaClient } from "wasp/server";

interface WebhookEventIdentity {
  paymentProcessorEventId: string;
  eventType: string;
}

/**
 * Payment processors deliver each webhook event at least once. They retry when
 * your endpoint fails or times out, so the same event can reach your app twice.
 * Handling a "paid" event twice would grant purchased credits twice.
 *
 * This function remembers the id of every processed event and skips the ones it
 * has already seen. It records the event only after `handleEvent` succeeds, so
 * the payment processor still retries a failed attempt.
 */
export async function processWebhookEventOnce(
  { paymentProcessorEventId, eventType }: WebhookEventIdentity,
  processedWebhookEventDelegate: PrismaClient["processedWebhookEvent"],
  handleEvent: () => Promise<void>,
): Promise<void> {
  const processedEvent = await processedWebhookEventDelegate.findUnique({
    where: { paymentProcessorEventId },
  });
  if (processedEvent) {
    console.info(
      `Skipping already processed webhook event ${paymentProcessorEventId} (${eventType})`,
    );
    return;
  }

  await handleEvent();

  await processedWebhookEventDelegate.create({
    data: { paymentProcessorEventId, eventType },
  });
}
