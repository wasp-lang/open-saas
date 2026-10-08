import { PrismaClient } from "@prisma/client";
import { User } from "wasp/entities";
import type { MiddlewareConfigFn } from "wasp/server";
import type { PaymentsWebhook } from "wasp/server/api";
import type { PaymentPlan } from "./plans";
import { paddlePaymentProcessor } from './paddle/paymentProcessor';

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

/**
 * Payment processors either redirect the user to a hosted checkout page,
 * or open the checkout within the page itself (e.g. an overlay).
 */
export type CheckoutSession =
  | { kind: "redirect"; id: string; url: string }
  | { kind: "inPage"; id: string };

export interface PaymentProcessor {
  id: "stripe" | "lemonsqueezy" | "polar" | "paddle";
  createCheckoutSession: (
    args: CreateCheckoutSessionArgs,
  ) => Promise<{ session: CheckoutSession }>;
  fetchCustomerPortalUrl: (
    args: FetchCustomerPortalUrlArgs,
  ) => Promise<string | null>;
  webhook: PaymentsWebhook;
  webhookMiddlewareConfigFn: MiddlewareConfigFn;
  fetchTotalRevenue: () => Promise<number>;
}

/**
 * Choose which payment processor you'd like to use, then delete the
 * other payment processor code that you're not using  from `/src/payment`
 */
export const paymentProcessor: PaymentProcessor = paddlePaymentProcessor;
// export const paymentProcessor: PaymentProcessor = lemonSqueezyPaymentProcessor;
// export const paymentProcessor: PaymentProcessor = polarPaymentProcessor;
// export const paymentProcessor: PaymentProcessor = paddlePaymentProcessor;
