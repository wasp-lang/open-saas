import { PrismaClient } from "@prisma/client";
import { User } from "wasp/entities";
import type { MiddlewareConfigFn } from "wasp/server";
import type { PaymentsWebhook } from "wasp/server/api";
import type { PaymentPlan } from "./plans";
import { stripePaymentProcessor } from "./stripe/paymentProcessor";

export interface CreateCheckoutSessionArgs {
  userId: User["id"];
  userEmail: NonNullable<User["email"]>;
  paymentPlan: PaymentPlan;
  prismaUserDelegate: PrismaClient["user"];
}

export interface FetchCustomerPortalUrlArgs {
  userId: User["id"];
  prismaUserDelegate: PrismaClient["user"];
}

export interface ConfirmCheckoutSessionArgs {
  sessionId: string;
  userId: User["id"];
  prismaUserDelegate: PrismaClient["user"];
  processedWebhookEventDelegate: PrismaClient["processedWebhookEvent"];
}

export type CheckoutSessionStatus = "paid" | "pending" | "failed";

/**
 * Payment processors either redirect the user to a hosted checkout page,
 * or open the checkout within the page itself (e.g. an overlay).
 */
export type CheckoutSession =
  | { kind: "redirect"; id: string; url: string }
  | { kind: "inPage"; id: string };

export type PaymentProcessorId =
  | "stripe"
  | "lemonsqueezy"
  | "polar"
  | "paddle"
  | "mpt";

export interface PaymentProcessor {
  id: PaymentProcessorId;
  createCheckoutSession: (
    args: CreateCheckoutSessionArgs,
  ) => Promise<{ session: CheckoutSession }>;
  fetchCustomerPortalUrl: (
    args: FetchCustomerPortalUrlArgs,
  ) => Promise<string | null>;
  webhook: PaymentsWebhook;
  webhookMiddlewareConfigFn: MiddlewareConfigFn;
  fetchTotalRevenue: () => Promise<number>;
  /**
   * Optional. Asks the payment processor directly whether a checkout was paid
   * and applies the purchase if so. For setups where webhooks can't reach the
   * app, e.g. a shared demo account used from many local dev servers.
   */
  confirmCheckoutSession?: (
    args: ConfirmCheckoutSessionArgs,
  ) => Promise<CheckoutSessionStatus>;
}

/**
 * Choose which payment processor you'd like to use, then delete the
 * other payment processor code that you're not using  from `/src/payment`
 *
 * Make sure to choose the same payment processor in `src/payment/paymentProcessorClient.ts`.
 */
export const paymentProcessor: PaymentProcessor = stripePaymentProcessor;
// export const paymentProcessor: PaymentProcessor = lemonSqueezyPaymentProcessor;
// export const paymentProcessor: PaymentProcessor = polarPaymentProcessor;
// export const paymentProcessor: PaymentProcessor = paddlePaymentProcessor;
// export const paymentProcessor: PaymentProcessor = mptPaymentProcessor;
