import type { SubscriptionStatus } from '../../payment/plans';
import { PaymentPlanId } from '../../payment/plans';
import { type StripeWebhook } from 'wasp/server/api';

export type PrismaUserDelegate = Parameters<StripeWebhook>[2]['entities']['User'];

type UserStripePaymentDetails = {
  userStripeId: string;
  subscriptionPlan?: PaymentPlanId;
  subscriptionStatus?: SubscriptionStatus;
  numOfCreditsPurchased?: number;
  datePaid?: Date;
};

export const updateUserStripePaymentDetails = (
  { userStripeId, subscriptionPlan, subscriptionStatus, datePaid, numOfCreditsPurchased }: UserStripePaymentDetails,
  userDelegate: PrismaUserDelegate
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
