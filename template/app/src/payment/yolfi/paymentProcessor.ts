import { createHash, randomUUID } from "node:crypto";
import { HttpError } from "wasp/server";
import type { PaymentProcessor } from "../paymentProcessor";
import { CHECKOUT_CANCELED_URL, CHECKOUT_SUCCESS_URL } from "../paths";
import { createYolfiSession, hostedUrl, isUuid, usdCents } from "./api";
import { yolfiCreditPack } from "./plan";
import { yolfiMiddlewareConfigFn, yolfiWebhook } from "./webhook";

export const yolfiPaymentProcessor: PaymentProcessor = {
  id: "yolfi",
  createCheckoutSession: async ({ userId, paymentPlan }) => {
    if (
      paymentPlan.id !== yolfiCreditPack.paymentPlanId ||
      paymentPlan.effect.kind !== "credits"
    ) {
      throw new HttpError(400, "Yolfi supports only the one-time credit pack");
    }
    if (!isUuid(userId))
      throw new HttpError(400, "Invalid Yolfi user reference");
    const merchantOrderId = `open-saas-${randomUUID()}`;
    const idempotencyKey = createHash("sha256")
      .update(merchantOrderId)
      .digest("hex");
    const session = await createYolfiSession(
      {
        amount: yolfiCreditPack.amount,
        currency: yolfiCreditPack.currency,
        merchantOrderId,
        clientReferenceId: userId,
        description: "10 Credits",
        metadata: {
          integration: "open-saas",
          paymentPlanId: yolfiCreditPack.paymentPlanId,
        },
        successUrl: CHECKOUT_SUCCESS_URL,
        cancelUrl: CHECKOUT_CANCELED_URL,
        expiresInMinutes: 60,
      },
      idempotencyKey,
    );
    if (
      session.merchantOrderId !== merchantOrderId ||
      session.currency !== yolfiCreditPack.currency ||
      usdCents(session.amount) !== usdCents(yolfiCreditPack.amount) ||
      session.status === "EXPIRED" ||
      (session.clientReferenceId !== undefined &&
        session.clientReferenceId !== userId)
    ) {
      throw new HttpError(
        502,
        "Yolfi checkout snapshot does not match the request",
      );
    }
    return {
      session: {
        kind: "redirect",
        id: session.id,
        url: hostedUrl(session.url),
      },
    };
  },
  // No recurring billing/customer portal or analytics-history API is implemented.
  fetchCustomerPortalUrl: async () => null,
  fetchSubscriptionState: async () => null,
  fetchTotalRevenue: async () => {
    throw new Error(
      "Yolfi revenue history is not supported by this integration",
    );
  },
  webhook: yolfiWebhook,
  webhookMiddlewareConfigFn: yolfiMiddlewareConfigFn,
};
