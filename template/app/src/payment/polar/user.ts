import { Customer } from "@polar-sh/sdk/models/components/customer.js";
import { User } from "wasp/entities";
import { PrismaClient } from "wasp/server";
import { PaymentPlanId, SubscriptionStatus } from "../plans";

export async function fetchUserPaymentProcessorUserId(
  userId: User["id"],
  prismaUserDelegate: PrismaClient["user"],
): Promise<string | null> {
  const user = await prismaUserDelegate.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      paymentProcessorUserId: true,
    },
  });

  return user.paymentProcessorUserId;
}

interface UpdateUserPaymentProcessorUserIdArgs {
  userId: User["id"];
  paymentProcessorUserId: NonNullable<User["paymentProcessorUserId"]>;
}

export function updateUserPaymentProcessorUserId(
  { userId, paymentProcessorUserId }: UpdateUserPaymentProcessorUserIdArgs,
  prismaUserDelegate: PrismaClient["user"],
): Promise<User> {
  return prismaUserDelegate.update({
    where: {
      id: userId,
    },
    data: {
      paymentProcessorUserId,
    },
  });
}

interface UpdateUserSubscriptionArgs {
  customerId: Customer["id"];
  paymentPlanId: PaymentPlanId;
  subscriptionStatus: SubscriptionStatus;
  datePaid?: Date;
}

export function updateUserSubscription(
  {
    customerId,
    paymentPlanId,
    subscriptionStatus,
    datePaid,
  }: UpdateUserSubscriptionArgs,
  userDelegate: PrismaClient["user"],
) {
  return userDelegate.update({
    where: {
      paymentProcessorUserId: customerId,
    },
    data: {
      subscriptionPlan: paymentPlanId,
      subscriptionStatus,
      datePaid,
    },
  });
}

interface UpdateUserCreditsArgs {
  customerId: Customer["id"];
  numOfCreditsPurchased: number;
  datePaid: Date;
}

export function updateUserCredits(
  { customerId, numOfCreditsPurchased, datePaid }: UpdateUserCreditsArgs,
  userDelegate: PrismaClient["user"],
) {
  return userDelegate.update({
    where: {
      paymentProcessorUserId: customerId,
    },
    data: {
      credits: { increment: numOfCreditsPurchased },
      datePaid,
    },
  });
}
