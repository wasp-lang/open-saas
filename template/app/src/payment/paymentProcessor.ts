import { PrismaClient } from "@prisma/client";
import type { MiddlewareConfigFn } from "wasp/server";
import type { PaymentsWebhook } from "wasp/server/api";
import type { PaymentPlan } from "./plans";
import { stripePaymentProcessor } from "./stripe/paymentProcessor";

export interface CreateCheckoutSessionArgs {
  userId: string;
  userEmail: string;
  paymentPlan: PaymentPlan;
  prismaUserDelegate: PrismaClient["user"];
}
export interface FetchCustomerPortalUrlArgs {
  userId: string;
  prismaUserDelegate: PrismaClient["user"];
}

export interface PaymentProcessor {
  id: "stripe" | "lemonsqueezy" | "polar";
  createCheckoutSession: (
    args: CreateCheckoutSessionArgs,
  ) => Promise<{ session: { id: string; url: string } }>;
  fetchCustomerPortalUrl: (
    args: FetchCustomerPortalUrlArgs,
  ) => Promise<string | null>;
  webhook: PaymentsWebhook;
  webhookMiddlewareConfigFn: MiddlewareConfigFn;
}

/**
 * Choose which payment processor you'd like to use, then delete the
 * other payment processor code that you're not using  from `/src/payment`
 */
// export const paymentProcessor: PaymentProcessor = lemonSqueezyPaymentProcessor;
// export const paymentProcessor: PaymentProcessor = polarPaymentProcessor;
export const paymentProcessor: PaymentProcessor = stripePaymentProcessor;
