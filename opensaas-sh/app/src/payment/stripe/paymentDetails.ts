import type { SubscriptionStatus } from '../plans';
import { PaymentPlanId } from '../plans';
import { PrismaClient } from '@prisma/client';

type UserStripePaymentDetails = {
  userStripeId: string;
  subscriptionPlan?: PaymentPlanId;
  subscriptionStatus?: SubscriptionStatus;
  numOfCreditsPurchased?: number;
  datePaid?: Date;
};

export const updateUserStripePaymentDetails = (
  { userStripeId, subscriptionPlan, subscriptionStatus, datePaid, numOfCreditsPurchased }: UserStripePaymentDetails,
  userDelegate: PrismaClient['user']
) => {
  return userDelegate.update({
    where: {
      stripeId: userStripeId,
    },
    data: {
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
      credits: numOfCreditsPurchased !== undefined ? { increment: numOfCreditsPurchased } : undefined,
    },
  });
};
