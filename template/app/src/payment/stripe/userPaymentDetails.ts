import { PrismaClient } from '@prisma/client';
import type { SubscriptionStatus } from '../plans';
import { PaymentPlanId } from '../plans';

export async function updateUserStripePaymentDetails(
  {
    stripeCustomerId,
    subscriptionPlan,
    subscriptionStatus,
    datePaid,
    numOfCreditsPurchased,
  }: {
    stripeCustomerId: string;
    subscriptionPlan?: PaymentPlanId;
    subscriptionStatus?: SubscriptionStatus;
    numOfCreditsPurchased?: number;
    datePaid?: Date;
  },
  userDelegate: PrismaClient['user']
) {
  return userDelegate.update({
    where: {
      paymentProcessorUserId: stripeCustomerId,
    },
    data: {
      paymentProcessorUserId: stripeCustomerId,
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
      credits: numOfCreditsPurchased !== undefined ? { increment: numOfCreditsPurchased } : undefined,
    },
  });
}
