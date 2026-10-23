import { HttpError } from "wasp/server";
import type {
  ConfirmCheckoutSession,
  GenerateCheckoutSession,
  GetCustomerPortalUrl,
} from "wasp/server/operations";
import * as z from "zod";
import { PaymentPlanId, paymentPlans } from "../payment/plans";
import { ensureArgsSchemaOrThrowHttpError } from "../server/validation";
import {
  type CheckoutSession,
  type CheckoutSessionStatus,
  paymentProcessor,
  type PaymentProcessorId,
} from "./paymentProcessor";

export type GeneratedCheckoutSession = CheckoutSession & {
  paymentProcessorId: PaymentProcessorId;
};

const generateCheckoutSessionSchema = z.nativeEnum(PaymentPlanId);

type GenerateCheckoutSessionInput = z.infer<
  typeof generateCheckoutSessionSchema
>;

export const generateCheckoutSession: GenerateCheckoutSession<
  GenerateCheckoutSessionInput,
  GeneratedCheckoutSession
> = async (rawPaymentPlanId, context) => {
  if (!context.user) {
    throw new HttpError(
      401,
      "Only authenticated users are allowed to perform this operation",
    );
  }

  const paymentPlanId = ensureArgsSchemaOrThrowHttpError(
    generateCheckoutSessionSchema,
    rawPaymentPlanId,
  );
  const userId = context.user.id;
  const userEmail = context.user.email;
  if (!userEmail) {
    // If using the usernameAndPassword Auth method, switch to an Auth method that provides an email.
    throw new HttpError(403, "User needs an email to make a payment.");
  }

  const paymentPlan = paymentPlans[paymentPlanId];
  const { session } = await paymentProcessor.createCheckoutSession({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate: context.entities.User,
  });

  return { ...session, paymentProcessorId: paymentProcessor.id };
};

export const getCustomerPortalUrl: GetCustomerPortalUrl<
  void,
  string | null
> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(
      401,
      "Only authenticated users are allowed to perform this operation",
    );
  }

  return paymentProcessor.fetchCustomerPortalUrl({
    userId: context.user.id,
    prismaUserDelegate: context.entities.User,
  });
};

const confirmCheckoutSessionSchema = z.string().min(1);

type ConfirmCheckoutSessionInput = z.infer<typeof confirmCheckoutSessionSchema>;

/**
 * Returns `unsupported` for payment processors that rely on webhooks only.
 */
export const confirmCheckoutSession: ConfirmCheckoutSession<
  ConfirmCheckoutSessionInput,
  CheckoutSessionStatus | "unsupported"
> = async (rawSessionId, context) => {
  if (!context.user) {
    throw new HttpError(
      401,
      "Only authenticated users are allowed to perform this operation",
    );
  }

  const sessionId = ensureArgsSchemaOrThrowHttpError(
    confirmCheckoutSessionSchema,
    rawSessionId,
  );
  if (!paymentProcessor.confirmCheckoutSession) {
    return "unsupported";
  }

  return paymentProcessor.confirmCheckoutSession({
    sessionId,
    userId: context.user.id,
    prismaUserDelegate: context.entities.User,
    processedWebhookEventDelegate: context.entities.ProcessedWebhookEvent,
  });
};
