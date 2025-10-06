import { PrismaClient } from "wasp/server";
import { PaymentPlanId, SubscriptionStatus } from "../plans";

interface UpdateUserSubscriptionDetailsArgs {
  polarCustomerId: string;
  subscriptionPlan: PaymentPlanId;
  subscriptionStatus: SubscriptionStatus | string;
  datePaid?: Date;
}

interface UpdateUserCreditsDetailsArgs {
  polarCustomerId: string;
  numOfCreditsPurchased: number;
  datePaid: Date;
}

export async function updateUserSubscription(
  args: UpdateUserSubscriptionDetailsArgs,
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
  args: UpdateUserCreditsDetailsArgs,
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
