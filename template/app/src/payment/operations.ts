import * as z from 'zod';
import type { GenerateCheckoutSession, GetCustomerPortalUrl } from 'wasp/server/operations';
import { PaymentPlanId, paymentPlans } from '../payment/plans';
import { paymentProcessor } from './paymentProcessor';
import { HttpError } from 'wasp/server';
import { ensureValidArgsOrThrowHttpError } from '../server/schema';

export type CheckoutSession = {
  sessionUrl: string | null;
  sessionId: string;
};

const generateCheckoutSessionArgsSchema = z.nativeEnum(PaymentPlanId, {
  message: 'Invalid payment plan ID provided.',
});

export const generateCheckoutSession: GenerateCheckoutSession<
  z.infer<typeof generateCheckoutSessionArgsSchema>,
  CheckoutSession
> = async (rawArgs: unknown, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  const userId = context.user.id;
  const userEmail = context.user.email;
  if (!userEmail) {
    throw new HttpError(
      403,
      'User needs an email to make a payment. If using the usernameAndPassword Auth method, switch to an Auth method that provides an email.'
    );
  }

  const args = ensureValidArgsOrThrowHttpError(rawArgs, generateCheckoutSessionArgsSchema);
  const paymentPlan = paymentPlans[args];
  const { session } = await paymentProcessor.createCheckoutSession({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate: context.entities.User,
  });

  return {
    sessionUrl: session.url,
    sessionId: session.id,
  };
};

export const getCustomerPortalUrl: GetCustomerPortalUrl<void, string | null> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return paymentProcessor.fetchCustomerPortalUrl({
    userId: context.user.id,
    prismaUserDelegate: context.entities.User,
  });
};
