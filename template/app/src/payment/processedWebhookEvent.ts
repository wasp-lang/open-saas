import { PrismaClient } from "wasp/server";

interface WebhookEventIdentity {
  paymentProcessorEventId: string;
  eventType: string;
}

/**
 * Payment processors deliver webhook events at least once and retry them when our
 * endpoint fails or times out, so the same event can reach us more than once.
 * Handling it twice would, for example, grant purchased credits twice.
 *
 * We remember the id of every processed event and skip the ones we have already seen.
 * The event is recorded only after it was handled successfully, so a failed attempt
 * is still retried by the payment processor.
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
