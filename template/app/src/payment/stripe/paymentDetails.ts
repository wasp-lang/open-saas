import type { SubscriptionStatus } from '../plans';
import { PaymentPlanId } from '../plans';
import { PrismaClient } from '@prisma/client';

interface UserStripePaymentDetails {
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
      paymentProcessorUserId: userStripeId
    },
    data: {
      paymentProcessorUserId: userStripeId,
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
      credits: numOfCreditsPurchased !== undefined ? { increment: numOfCreditsPurchased } : undefined,
    },
  });
};
