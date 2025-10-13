import { PrismaClient } from "wasp/server";
import { PaymentPlanId, SubscriptionStatus } from "../plans";

interface UpdateUserCreditsArgs {
  polarCustomerId: string;
  numOfCreditsPurchased: number;
  datePaid: Date;
}

interface UpdateUserSubscriptionArgs {
  polarCustomerId: string;
  subscriptionPlan: PaymentPlanId;
  subscriptionStatus: SubscriptionStatus;
  datePaid?: Date;
}

export async function updateUserSubscription(
  args: UpdateUserSubscriptionArgs,
  userDelegate: PrismaClient["user"],
) {
  const { polarCustomerId, subscriptionPlan, subscriptionStatus, datePaid } =
    args;

  return await userDelegate.update({
    where: {
      paymentProcessorUserId: polarCustomerId,
    },
    data: {
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
    },
  });
}

export async function updateUserCredits(
  args: UpdateUserCreditsArgs,
  userDelegate: PrismaClient["user"],
) {
  const { polarCustomerId, numOfCreditsPurchased, datePaid } = args;

  return await userDelegate.update({
    where: {
      paymentProcessorUserId: polarCustomerId,
    },
    data: {
      credits: { increment: numOfCreditsPurchased },
      datePaid,
    },
  });
}
