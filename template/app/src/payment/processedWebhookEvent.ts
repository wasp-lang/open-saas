import { Prisma } from "@prisma/client";
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
 * This function records the event id first and runs `handleEvent` second.
 * Recording first matters because a retry can arrive while the first attempt
 * is still running.
 *
 * If `handleEvent` throws, the function removes the record so the payment
 * processor can retry the event.
 */
export async function processWebhookEventOnce(
  webhookEvent: WebhookEventIdentity,
  processedWebhookEventDelegate: PrismaClient["processedWebhookEvent"],
  handleEvent: () => Promise<void>,
): Promise<void> {
  const isNewEvent = await recordWebhookEvent(
    webhookEvent,
    processedWebhookEventDelegate,
  );
  if (!isNewEvent) {
    console.info(
      `Skipping already processed webhook event ${webhookEvent.paymentProcessorEventId} (${webhookEvent.eventType})`,
    );
    return;
  }

  try {
    await handleEvent();
  } catch (error) {
    await processedWebhookEventDelegate.delete({
      where: { paymentProcessorEventId: webhookEvent.paymentProcessorEventId },
    });
    throw error;
  }
}

/**
 * Returns `false` if the event was already recorded.
 */
async function recordWebhookEvent(
  webhookEvent: WebhookEventIdentity,
  processedWebhookEventDelegate: PrismaClient["processedWebhookEvent"],
): Promise<boolean> {
  try {
    await processedWebhookEventDelegate.create({ data: webhookEvent });
    return true;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return false;
    }
    throw error;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
