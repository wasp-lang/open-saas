import type { SubscriptionStatus } from '../plans';
import { PaymentPlanId } from '../plans';
import { PrismaClient } from '@prisma/client';

type UserLemonSqueezyPaymentDetails = {
  lemonSqueezyId: string;
  userId: string;
  subscriptionPlan?: PaymentPlanId;
  subscriptionStatus?: SubscriptionStatus;
  numOfCreditsPurchased?: number;
  lemonSqueezyCustomerPortalUrl?: string;
  datePaid?: Date;
};

export const updateUserLemonSqueezyPaymentDetails = async (
  { lemonSqueezyId, userId, subscriptionPlan, subscriptionStatus, datePaid, numOfCreditsPurchased, lemonSqueezyCustomerPortalUrl }: UserLemonSqueezyPaymentDetails,
  prismaUserDelegate: PrismaClient['user']
) => {
  return prismaUserDelegate.update({
    where: {
      id: userId,
    },
    data: {
      lemonSqueezyId,
      lemonSqueezyCustomerPortalUrl,
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
      credits: numOfCreditsPurchased !== undefined ? { increment: numOfCreditsPurchased } : undefined,
    },
  });
};
