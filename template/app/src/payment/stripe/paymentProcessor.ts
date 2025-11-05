import Stripe from "stripe";
import { env } from "wasp/server";
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

    await prismaUserDelegate.update({
      where: {
        id: userId,
      },
      data: {
        paymentProcessorUserId: customer.id,
      },
    });

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
  fetchCustomerPortalUrl: async (args: FetchCustomerPortalUrlArgs) => {
    const { paymentProcessorUserId } =
      await args.prismaUserDelegate.findUniqueOrThrow({
        where: {
          id: args.userId,
        },
        select: {
          paymentProcessorUserId: true,
        },
      });

    if (!paymentProcessorUserId) {
      return null;
    }

    const billingPortalSession =
      await stripeClient.billingPortal.sessions.create({
        customer: paymentProcessorUserId,
        return_url: `${env.WASP_WEB_CLIENT_URL}account`,
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
