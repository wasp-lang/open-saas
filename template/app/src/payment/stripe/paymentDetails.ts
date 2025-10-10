import { PrismaClient } from "@prisma/client";
import type { SubscriptionStatus } from "../plans";
import { PaymentPlanId } from "../plans";

export const updateUserStripePaymentDetails = async (
  {
    userStripeId,
    subscriptionPlan,
    subscriptionStatus,
    datePaid,
    numOfCreditsPurchased,
  }: {
    userStripeId: string;
    subscriptionPlan?: PaymentPlanId;
    subscriptionStatus?: SubscriptionStatus;
    numOfCreditsPurchased?: number;
    datePaid?: Date;
  },
  userDelegate: PrismaClient["user"],
) => {
  return userDelegate.update({
    where: {
      paymentProcessorUserId: userStripeId,
    },
    data: {
      paymentProcessorUserId: userStripeId,
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
      credits:
        numOfCreditsPurchased !== undefined
          ? { increment: numOfCreditsPurchased }
          : undefined,
    },
  });
};
