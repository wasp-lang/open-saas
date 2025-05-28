import type { SubscriptionStatus } from '../plans';
import { PaymentPlanId } from '../plans';
import { PrismaClient } from '@prisma/client';

export const updateUserStripePaymentDetails = async (
  { userStripeId, subscriptionPlan, subscriptionStatus, datePaid, numOfCreditsPurchased }: {
    userStripeId: string;
    subscriptionPlan?: PaymentPlanId;
    subscriptionStatus?: SubscriptionStatus;
    numOfCreditsPurchased?: number;
    datePaid?: Date;
  },
  userDelegate: PrismaClient['user']
) => {
  const user = await userDelegate.findFirst({
    where: { paymentProcessorUserId: userStripeId },
  });

  if (!user) {
    throw new Error(`User not found with paymentProcessorUserId ${userStripeId}`);
  }

  return userDelegate.update({
    where: { id: user.id },
    data: {
      paymentProcessorUserId: userStripeId,
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
      credits: numOfCreditsPurchased !== undefined ? { increment: numOfCreditsPurchased } : undefined,
    },
  });
};
