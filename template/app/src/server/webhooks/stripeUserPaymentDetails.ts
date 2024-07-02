import { type SubscriptionStatusOptions } from '../../shared/types';
import { type PaymentPlanIds } from '../../shared/constants';
import { PrismaClient } from '@prisma/client';

type UserPaymentDetails = {
  userStripeId: string;
  subscriptionTier?: Omit<PaymentPlanIds, 'CREDITS'>;
  subscriptionStatus?: SubscriptionStatusOptions;
  numOfCreditsPurchased?: number;
  datePaid?: Date;
};

export const updateUserPaymentDetails = async (args: UserPaymentDetails, userDelegate: PrismaClient['user']) => {
  let data: any = {};
  if (args.datePaid) data.datePaid = args.datePaid;
  if (args.subscriptionTier) data.subscriptionTier = args.subscriptionTier as string;
  if (args.subscriptionStatus) data.subscriptionStatus = args.subscriptionStatus;
  if (args.numOfCreditsPurchased) {
    data.credits = { increment: args.numOfCreditsPurchased };
  }

  return await userDelegate.update({
    where: {
      stripeId: args.userStripeId,
    },
    data
  });
};
