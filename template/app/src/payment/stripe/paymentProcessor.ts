import Stripe from "stripe";
import { config } from "wasp/server";
import { assertUnreachable } from "../../shared/utils";
import type {
  CreateCheckoutSessionArgs,
  FetchCustomerPortalUrlArgs,
  PaymentProcessor,
} from "../paymentProcessor";
import type { PaymentPlanEffect } from "../plans";
import {
  createStripeCheckoutSession,
  ensureStripeCustomer,
} from "./checkoutUtils";
import { stripeClient } from "./stripeClient";
import {
  fetchUserPaymentProcessorUserId,
  updateUserPaymentProcessorUserId,
} from "./user";
import { stripeMiddlewareConfigFn, stripeWebhook } from "./webhook";

export const stripePaymentProcessor: PaymentProcessor = {
  id: "stripe",
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate,
  }: CreateCheckoutSessionArgs) => {
    const customer = await ensureStripeCustomer(userEmail);

    await updateUserPaymentProcessorUserId(
      {
        userId,
        paymentProcessorUserId: customer.id,
      },
      prismaUserDelegate,
    );

    const stripeSession = await createStripeCheckoutSession({
      customerId: customer.id,
      priceId: paymentPlan.getPaymentProcessorPlanId(),
      mode: paymentPlanEffectToStripeCheckoutSessionMode(paymentPlan.effect),
    });

    if (!stripeSession.url) {
      throw new Error(
        "Stripe checkout session URL is missing. Checkout session might not be active.",
      );
    }

    return {
      session: {
        url: stripeSession.url,
        id: stripeSession.id,
      },
    };
  },
  fetchCustomerPortalUrl: async ({
    prismaUserDelegate,
    userId,
  }: FetchCustomerPortalUrlArgs) => {
    const paymentProcessorUserId = await fetchUserPaymentProcessorUserId(
      userId,
      prismaUserDelegate,
    );

    if (!paymentProcessorUserId) {
      return null;
    }

    const billingPortalSession =
      await stripeClient.billingPortal.sessions.create({
        customer: paymentProcessorUserId,
        return_url: `${config.frontendUrl}/account`,
      });

    return billingPortalSession.url;
  },
  webhook: stripeWebhook,
  webhookMiddlewareConfigFn: stripeMiddlewareConfigFn,
};

function paymentPlanEffectToStripeCheckoutSessionMode({
  kind,
}: PaymentPlanEffect): Stripe.Checkout.Session.Mode {
  switch (kind) {
    case "subscription":
      return "subscription";
    case "credits":
      return "payment";
    default:
      assertUnreachable(kind);
  }
}
