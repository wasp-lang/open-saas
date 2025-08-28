import type { PrismaClient } from '@prisma/client';
import type { PaymentPlanId, SubscriptionStatus } from '../plans';

export const updateUserPolarPaymentDetails = async (
  {
    userId,
    polarCustomerId,
    subscriptionPlan,
    subscriptionStatus,
    numOfCreditsPurchased,
    datePaid,
  }: {
    userId: string;
    polarCustomerId?: string;
    subscriptionPlan?: PaymentPlanId;
    subscriptionStatus?: SubscriptionStatus | string;
    numOfCreditsPurchased?: number;
    datePaid?: Date;
  },
  userDelegate: PrismaClient['user']
) => {
  return await userDelegate.update({
    where: {
      id: userId,
    },
    data: {
      ...(polarCustomerId && { paymentProcessorUserId: polarCustomerId }),
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
      credits: numOfCreditsPurchased !== undefined ? { increment: numOfCreditsPurchased } : undefined,
    },
  });
};
