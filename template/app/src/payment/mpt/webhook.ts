import express from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env, type MiddlewareConfigFn, type PrismaClient } from "wasp/server";
import type { PaymentsWebhook } from "wasp/server/api";
import { UnhandledWebhookEventError } from "../errors";
import { processWebhookEventOnce } from "../processedWebhookEvent";
import type { MptIntentMetadata } from "./mptClient";
import { grantMptPurchase } from "./purchase";

/**
 * The subset of MPT webhook payloads Open SaaS reads. MPT signs every event
 * with the Standard Webhooks scheme (`webhook-id`, `webhook-timestamp`,
 * `webhook-signature` headers).
 */
interface MptWebhookEvent {
  type: string;
  event_id: string;
  occurred_at: string;
  sid: string | null;
  amount_cents?: number;
  amount_received_cents?: number | null;
  metadata?: MptIntentMetadata | null;
}

const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

/**
 * The signature covers the exact bytes MPT sent, so we need the raw body.
 */
export const mptMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig) => {
  middlewareConfig.delete("express.json");
  middlewareConfig.set(
    "express.raw",
    express.raw({ type: "application/json" }),
  );

  return middlewareConfig;
};

export const mptWebhook: PaymentsWebhook = async (
  request,
  response,
  context,
) => {
  try {
    const webhookId = getHeader(request, "webhook-id");
    const rawBody = request.body as Buffer;
    verifyMptSignature({
      webhookId,
      timestamp: getHeader(request, "webhook-timestamp"),
      signatureHeader: getHeader(request, "webhook-signature"),
      rawBody,
    });
    const event = JSON.parse(rawBody.toString("utf8")) as MptWebhookEvent;

    await processWebhookEventOnce(
      { paymentProcessorEventId: webhookId, eventType: event.type },
      context.entities.ProcessedWebhookEvent,
      () => handleMptEvent(event, context.entities.User),
    );
    return response.status(204).send();
  } catch (error) {
    if (error instanceof UnhandledWebhookEventError) {
      // In development, it is likely that we will receive events that we are not handling.
      if (process.env.NODE_ENV === "development") {
        console.info("Unhandled MPT webhook event in development: ", error);
      } else if (process.env.NODE_ENV === "production") {
        console.error("Unhandled MPT webhook event in production: ", error);
      }

      // We must return a 2XX status code, otherwise MPT will keep retrying the event.
      return response.status(200).json({ error: error.message });
    }

    console.error("MPT webhook error: ", error);
    if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    } else {
      return response
        .status(500)
        .json({ error: "Error processing MPT webhook event" });
    }
  }
};

function getHeader(request: express.Request, name: string): string {
  const value = request.headers[name];
  if (typeof value !== "string") {
    throw new Error(`MPT webhook header ${name} not provided`);
  }
  return value;
}

interface VerifyMptSignatureArgs {
  webhookId: string;
  timestamp: string;
  signatureHeader: string;
  rawBody: Buffer;
}

function verifyMptSignature({
  webhookId,
  timestamp,
  signatureHeader,
  rawBody,
}: VerifyMptSignatureArgs): void {
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > WEBHOOK_TOLERANCE_SECONDS) {
    throw new Error("MPT webhook timestamp is outside the tolerance window");
  }

  const secret = Buffer.from(
    env.MPT_WEBHOOK_SECRET.replace(/^whsec_/, ""),
    "base64",
  );
  const expected = createHmac("sha256", secret)
    .update(`${webhookId}.${timestamp}.`)
    .update(rawBody)
    .digest();

  // The header can carry several space separated `v1,<base64>` signatures
  // while a secret is being rotated.
  const isValid = signatureHeader.split(" ").some((versionedSignature) => {
    const [version, signature] = versionedSignature.split(",");
    if (version !== "v1" || !signature) {
      return false;
    }
    const received = Buffer.from(signature, "base64");
    return (
      received.length === expected.length && timingSafeEqual(received, expected)
    );
  });

  if (!isValid) {
    throw new Error("MPT webhook signature is invalid");
  }
}

async function handleMptEvent(
  event: MptWebhookEvent,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  switch (event.type) {
    case "intent.paid":
      await grantMptPurchase(
        { ...event, paidAt: new Date(event.occurred_at) },
        userDelegate,
      );
      break;
    // `payment.late` is money that arrived after the intent expired, in any
    // amount. Only a full payment buys the plan.
    case "payment.late":
      if (isPaidInFull(event)) {
        await grantMptPurchase(
          { ...event, paidAt: new Date(event.occurred_at) },
          userDelegate,
        );
      } else {
        console.warn("MPT late payment is short, not granted: ", event);
      }
      break;
    // Monerium holds the SEPA funds, EURe is not minted yet. `intent.paid`
    // follows, usually within seconds.
    case "payment.received":
      break;
    // Funds go back to the payer (rejected) or the payer sent less than the
    // plan price (underpaid). Nothing is granted, but someone should look.
    case "payment.rejected":
    case "payment.underpaid":
      console.warn(`MPT payment not granted (${event.type}): `, event);
      break;
    default:
      throw new UnhandledWebhookEventError(event.type);
  }
}

function isPaidInFull({
  amount_cents,
  amount_received_cents,
}: MptWebhookEvent): boolean {
  return (
    amount_cents !== undefined &&
    amount_received_cents != null &&
    amount_received_cents >= amount_cents
  );
}
