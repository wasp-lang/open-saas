import { type SubscriptionStatusOptions } from '../../shared/types';
import { type PaymentPlanIds } from '../../shared/constants';

type UserPaymentDetails = {
  userStripeId: string;
  subscriptionTier?: Omit<PaymentPlanIds, 'CREDITS'>;
  subscriptionStatus?: SubscriptionStatusOptions;
  numOfCreditsPurchased?: number;
  datePaid?: Date;
};

export const updateUserPaymentDetails = async (args: UserPaymentDetails, context: any) => {
  return await context.entities.User.update({
    where: {
      stripeId: args.userStripeId,
    },
    data: {
      datePaid: args.datePaid,
      subscriptionTier: args.subscriptionTier,
      subscriptionStatus: args.subscriptionStatus,
      credits: {
        increment: args.numOfCreditsPurchased,
      },
    },
  });
};
