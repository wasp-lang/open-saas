import { PrismaClient } from 'wasp/server';
import { PaymentPlanId, SubscriptionStatus } from '../plans';

export interface UpdateUserPaymentDetailsArgs {
  polarCustomerId?: string;
  subscriptionPlan?: PaymentPlanId;
  subscriptionStatus?: SubscriptionStatus | string;
  numOfCreditsPurchased?: number;
  datePaid?: Date;
}

export async function updateUserPaymentDetails(
  args: UpdateUserPaymentDetailsArgs,
  userDelegate: PrismaClient['user']
) {
  const { polarCustomerId, subscriptionPlan, subscriptionStatus, numOfCreditsPurchased, datePaid } = args;

  return await userDelegate.update({
    where: {
      paymentProcessorUserId: polarCustomerId,
    },
    data: {
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
      credits: numOfCreditsPurchased !== undefined ? { increment: numOfCreditsPurchased } : undefined,
    },
  });
}
