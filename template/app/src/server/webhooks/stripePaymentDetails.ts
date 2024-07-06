import type { SubscriptionStatusOptions } from '../../payment/plans';
import { PaymentPlanId } from '../../payment/plans';
import { PrismaClient } from '@prisma/client';

export type PrismaUserDelegate = PrismaClient['user'];

type UserStripePaymentDetails = {
  userStripeId: string;
  subscriptionPlan?: PaymentPlanId;
  subscriptionStatus?: SubscriptionStatusOptions;
  numOfCreditsPurchased?: number;
  datePaid?: Date;
};

export const updateUserStripePaymentDetails = async (
  args: UserStripePaymentDetails,
  userDelegate: PrismaUserDelegate
) => {
  let data: any = {};
  if (args.datePaid) data.datePaid = args.datePaid;
  if (args.subscriptionPlan) data.subscriptionPlan = args.subscriptionPlan;
  if (args.subscriptionStatus) data.subscriptionStatus = args.subscriptionStatus;
  if (args.numOfCreditsPurchased) {
    data.credits = { increment: args.numOfCreditsPurchased };
  }

  return await userDelegate.update({
    where: {
      stripeId: args.userStripeId,
    },
    data,
  });
};
