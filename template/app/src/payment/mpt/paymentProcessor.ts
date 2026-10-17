import { randomBytes } from "node:crypto";
import { HttpError } from "wasp/server";
import { getCheckoutConfirmationUrl } from "../paths";
import {
  type ConfirmCheckoutSessionArgs,
  type CreateCheckoutSessionArgs,
  type PaymentProcessor,
} from "../paymentProcessor";
import { prettyPaymentPlanName } from "../plans";
import { processWebhookEventOnce } from "../processedWebhookEvent";
import { updateUserPaymentProcessorUserId } from "../user";
import { getMptPlanAmountEur } from "./checkoutUtils";
import {
  createMptPaymentIntent,
  getMptIntentSettlement,
  getMptIntentStats,
  getMptPaymentIntent,
} from "./mptClient";
import { getMptPurchaseEventId, grantMptPurchase } from "./purchase";
import { mptMiddlewareConfigFn, mptWebhook } from "./webhook";

export const mptPaymentProcessor: PaymentProcessor = {
  id: "mpt",
  createCheckoutSession: async ({
    userId,
    paymentPlan,
    prismaUserDelegate,
  }: CreateCheckoutSessionArgs) => {
    // A SEPA transfer is a one-time push payment, so MPT cannot renew a
    // subscription on its own.
    // A 400 shows the message on the pricing page instead of a generic 500.
    if (paymentPlan.effect.kind !== "credits") {
      throw new HttpError(
        400,
        `${prettyPaymentPlanName(paymentPlan.id)} is a subscription, and bank transfers can't renew on their own. Choose a credits plan instead.`,
      );
    }

    // MPT has no customer object, so the Open SaaS user id doubles as the
    // payment processor user id that the webhook looks the user up by.
    await updateUserPaymentProcessorUserId(
      { userId, paymentProcessorUserId: userId },
      prismaUserDelegate,
    );

    // We pick the session id ourselves so the return URL can carry it.
    const sid = randomBytes(12).toString("base64url");
    const intent = await createMptPaymentIntent({
      sid,
      amountEur: getMptPlanAmountEur(paymentPlan),
      label: prettyPaymentPlanName(paymentPlan.id),
      metadata: { userId, paymentPlanId: paymentPlan.id },
      // MPT appends `mpt_sid` and `mpt_status` to it. The status is a hint
      // only, so the checkout page confirms the payment with the server.
      returnUrl: getCheckoutConfirmationUrl(sid),
    });

    return {
      session: {
        kind: "redirect",
        id: intent.sid,
        url: intent.checkout_url,
      },
    };
  },
  // MPT has no customer portal: there is no subscription to manage.
  fetchCustomerPortalUrl: async () => null,
  webhook: mptWebhook,
  webhookMiddlewareConfigFn: mptMiddlewareConfigFn,
  fetchTotalRevenue: async () => {
    const { paid, late } = await getMptIntentStats();
    // Late payments are credited too (see `getMptIntentSettlement`), so they
    // count as revenue. Underpaid money is not, since nothing was granted.
    const totalRevenueCents =
      paid.amount_received_cents + late.amount_received_cents;

    // Revenue is in cents so we convert to euros
    return totalRevenueCents / 100;
  },
  // Lets the shared MPT demo account work without webhooks: a single webhook
  // endpoint can't reach every local dev server.
  confirmCheckoutSession: async ({
    sessionId,
    userId,
    prismaUserDelegate,
    processedWebhookEventDelegate,
  }: ConfirmCheckoutSessionArgs) => {
    const intent = await getMptPaymentIntent(sessionId);
    if (intent.metadata?.userId !== userId) {
      throw new Error(`MPT intent ${sessionId} belongs to another user`);
    }

    const settlement = getMptIntentSettlement(intent);
    if (settlement === "pending" || settlement === "failed") {
      return settlement;
    }

    await processWebhookEventOnce(
      {
        paymentProcessorEventId: getMptPurchaseEventId(sessionId, settlement),
        eventType: settlement === "paid" ? "intent.paid" : "payment.late",
      },
      processedWebhookEventDelegate,
      () =>
        grantMptPurchase(
          {
            sid: intent.sid,
            metadata: intent.metadata,
            paidAt: intent.paid_at ? new Date(intent.paid_at) : new Date(),
          },
          prismaUserDelegate,
        ),
    );
    return "paid";
  },
};
