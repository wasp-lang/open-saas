import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import express from "express";
import { env, HttpError, prisma, type MiddlewareConfigFn } from "wasp/server";
import type { PaymentsWebhook } from "wasp/server/api";
import { isSessionId, isUuid, retrieveYolfiSession, usdCents } from "./api";
import { yolfiCreditPack, yolfiCredits } from "./plan";

export const yolfiMiddlewareConfigFn: MiddlewareConfigFn = (
  middlewareConfig,
) => {
  middlewareConfig.delete("express.json");
  middlewareConfig.set(
    "express.raw",
    express.raw({ type: "application/json", limit: "64kb" }),
  );
  return middlewareConfig;
};

function verifySignature(
  raw: unknown,
  signature: string | undefined,
  webhookSecret: string | undefined,
): void {
  if (!webhookSecret)
    throw new HttpError(503, "Yolfi webhook configuration is required");
  if (
    !Buffer.isBuffer(raw) ||
    !signature ||
    !/^[A-Za-z0-9+/]{43}=$/.test(signature)
  ) {
    throw new HttpError(400, "Invalid Yolfi signature or raw body");
  }
  const expected = createHmac("sha256", webhookSecret).update(raw).digest();
  const actual = Buffer.from(signature, "base64");
  if (actual.length !== expected.length || !timingSafeEqual(expected, actual)) {
    throw new HttpError(400, "Invalid Yolfi signature");
  }
}

export const yolfiWebhook: PaymentsWebhook = async (request, response) => {
  try {
    verifySignature(
      request.body,
      request.get("X-Yolfi-Signature"),
      env.YOLFI_WEBHOOK_SECRET,
    );
    let event;
    try {
      event = JSON.parse(request.body.toString("utf8"));
    } catch {
      throw new HttpError(400, "Invalid Yolfi JSON");
    }
    if (
      !event ||
      typeof event.id !== "string" ||
      !/^evt_[A-Za-z0-9_-]{1,128}$/.test(event.id) ||
      typeof event.type !== "string"
    ) {
      throw new HttpError(400, "Invalid Yolfi event");
    }
    // Failed, expired and unrelated events never fulfill an order.
    if (event.type !== "payment.confirmed")
      return response.status(200).json({ received: true });
    const data = event.data;
    if (
      event.livemode !== true ||
      !Number.isSafeInteger(event.created) ||
      event.created <= 0 ||
      !Number.isFinite(new Date(event.created * 1000).getTime()) ||
      !data ||
      data.status !== "confirmed" ||
      data.paymentType !== "ONE_TIME" ||
      !isSessionId(data.checkoutSessionId) ||
      !isUuid(data.invoiceId) ||
      typeof data.merchantOrderId !== "string" ||
      !data.merchantOrderId.startsWith("open-saas-") ||
      !isUuid(data.merchantOrderId.slice("open-saas-".length))
    ) {
      throw new HttpError(400, "Invalid Yolfi one-time confirmation");
    }
    const eventKey = `yolfi:event:${event.id}`;
    if (
      await prisma.processedWebhookEvent.findUnique({
        where: { paymentProcessorEventId: eventKey },
      })
    ) {
      return response.status(200).json({ received: true });
    }
    // COMPLETED only means invoice creation. The signed confirmed event is
    // required in addition to this authenticated immutable pricing snapshot.
    const session = await retrieveYolfiSession(data.checkoutSessionId);
    if (
      session.id !== data.checkoutSessionId ||
      session.status !== "COMPLETED" ||
      session.merchantOrderId !== data.merchantOrderId ||
      !isUuid(session.clientReferenceId) ||
      session.metadata?.integration !== "open-saas" ||
      session.metadata?.paymentPlanId !== yolfiCreditPack.paymentPlanId ||
      session.currency !== yolfiCreditPack.currency ||
      data.currency !== session.currency ||
      usdCents(session.amount) !== usdCents(yolfiCreditPack.amount)
    ) {
      throw new HttpError(
        409,
        "Yolfi confirmation does not match the checkout",
      );
    }
    // data.amount is a token receivable, not source-currency pricing. Never
    // compare it (or approximate amountUsd) to the fiat checkout amount.
    const userReference = session.clientReferenceId;
    const paymentProcessorEventIds = [
      eventKey,
      `yolfi:invoice:${data.invoiceId}`,
      `yolfi:checkout:${session.id}`,
    ];
    try {
      // Dedupe and crediting commit together, including on concurrent deliveries.
      // Event-id-only dedupe would allow another event for the same invoice.
      await prisma.$transaction(async (tx) => {
        await tx.processedWebhookEvent.createMany({
          data: paymentProcessorEventIds.map((paymentProcessorEventId) => ({
            paymentProcessorEventId,
            eventType: event.type,
          })),
        });
        await tx.user.update({
          where: { id: userReference },
          data: {
            credits: { increment: yolfiCredits() },
            datePaid: new Date(event.created * 1000),
          },
        });
      });
    } catch (error) {
      if (!(
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ))
        throw error;
      // An existing event/invoice/session key proves this purchase was applied.
    }
    return response.status(200).json({ received: true });
  } catch (error) {
    if (error instanceof HttpError)
      return response.status(error.statusCode).json({ error: error.message });
    // Do not acknowledge transient persistence failures: delivery must retry.
    // Never log payment payloads, credential values, or provider error bodies.
    return response
      .status(503)
      .json({ error: "Yolfi confirmation could not be processed" });
  }
};
