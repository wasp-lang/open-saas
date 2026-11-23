import type { WebhookOrderPaidPayload } from "@polar-sh/sdk/models/components/webhookorderpaidpayload.js";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import express from "express";
import { env, type MiddlewareConfigFn, type PrismaClient } from "wasp/server";
import type { PaymentsWebhook } from "wasp/server/api";
import { UnhandledWebhookEventError } from "../errors";
import { findPaymentPlanIdByPaymentProcessorPlanId } from "../paymentProcessorPlans";
import { getPaymentPlanCreditsAmount } from "../plans";
import { processWebhookEventOnce } from "../processedWebhookEvent";
import { syncUserSubscription } from "../subscription";
import { recordUserPayment } from "../user";
import { fetchPolarSubscriptionState } from "./subscriptionState";

type PolarWebhookEvent = ReturnType<typeof validateEvent>;

/**
 * Polar requires a raw request to construct events successfully.
 */
export const polarMiddlewareConfigFn: MiddlewareConfigFn = (
  middlewareConfig,
) => {
  middlewareConfig.delete("express.json");
  middlewareConfig.set(
    "express.raw",
    express.raw({ type: "application/json" }),
  );

  return middlewareConfig;
};

export const polarWebhook: PaymentsWebhook = async (
  request,
  response,
  context,
) => {
  try {
    const event = validateEvent(
      request.body,
      request.headers as Record<string, string>,
      env.POLAR_WEBHOOK_SECRET,
    );

    await handlePolarEvent(
      event,
      getPolarEventId(request),
      context.entities.User,
      context.entities.ProcessedWebhookEvent,
    );
    return response.status(204).send();
  } catch (error) {
    if (error instanceof UnhandledWebhookEventError) {
      // In development, it is likely that we will receive events that we are not handling.
      if (process.env.NODE_ENV === "development") {
        console.info("Unhandled Polar webhook event in development: ", error);
      } else if (process.env.NODE_ENV === "production") {
        console.error("Unhandled Polar webhook event in production: ", error);
      }

      // We must return a 2XX status code, otherwise Polar will keep retrying the event.
      return response.status(200).json({ error: error.message });
    }

    console.error("Polar webhook error: ", error);
    if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    } else {
      return response
        .status(500)
        .json({ error: "Error processing Polar webhook event" });
    }
  }
};

/**
 * Polar uses the `webhook-id` header as the stable webhook event id.
 */
function getPolarEventId(request: express.Request): string {
  const webhookId = request.headers["webhook-id"];
  if (typeof webhookId !== "string") {
    throw new Error("Polar webhook id not provided");
  }
  return webhookId;
}

async function handlePolarEvent(
  event: PolarWebhookEvent,
  eventId: string,
  userDelegate: PrismaClient["user"],
  processedWebhookEventDelegate: PrismaClient["processedWebhookEvent"],
): Promise<void> {
  if (!isHandledPolarEvent(event)) {
    throw new UnhandledWebhookEventError(event.type);
  }

  if (event.type === "order.paid") {
    // Payments can't be fetched again, so we record each one once.
    await processWebhookEventOnce(
      { paymentProcessorEventId: eventId, eventType: event.type },
      processedWebhookEventDelegate,
      () => handleOrderPaid(event, userDelegate),
    );
  }

  await syncUserSubscription(
    event.data.customerId,
    fetchPolarSubscriptionState,
    userDelegate,
  );
}

function isHandledPolarEvent(
  event: PolarWebhookEvent,
): event is HandledPolarEvent {
  return (HANDLED_POLAR_EVENT_TYPES as readonly string[]).includes(event.type);
}

/**
 * Every event here triggers `syncUserSubscription`.
 * Your Polar webhook must send all of them.
 * See: https://docs.opensaas.sh/guides/deploying/#polar
 */
const HANDLED_POLAR_EVENT_TYPES = [
  "order.paid",
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.canceled",
  "subscription.uncanceled",
  "subscription.revoked",
] as const satisfies PolarWebhookEvent["type"][];

type HandledPolarEvent = Extract<
  PolarWebhookEvent,
  { type: (typeof HANDLED_POLAR_EVENT_TYPES)[number] }
>;

async function handleOrderPaid(
  { data: order }: WebhookOrderPaidPayload,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  const paymentPlanId =
    order.productId &&
    findPaymentPlanIdByPaymentProcessorPlanId(order.productId);

  await recordUserPayment(
    {
      paymentProcessorUserId: order.customerId,
      datePaid: order.createdAt,
      numOfCreditsPurchased: paymentPlanId
        ? getPaymentPlanCreditsAmount(paymentPlanId)
        : 0,
    },
    userDelegate,
  );
}
