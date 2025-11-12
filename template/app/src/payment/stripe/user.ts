import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { User } from "wasp/entities";
import type { SubscriptionStatus } from "../plans";
import { PaymentPlanId } from "../plans";

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

interface UpdateUserOneTimePaymentDetailsArgs {
  customerId: Stripe.Customer["id"];
  datePaid: Date;
  numOfCreditsPurchased: number;
}

export function updateUserOneTimePaymentDetails(
  {
    customerId,
    datePaid,
    numOfCreditsPurchased,
  }: UpdateUserOneTimePaymentDetailsArgs,
  userDelegate: PrismaClient["user"],
): Promise<User> {
  return userDelegate.update({
    where: {
      paymentProcessorUserId: customerId,
    },
    data: {
      datePaid,
      credits: { increment: numOfCreditsPurchased },
    },
  });
}

interface UpdateUserSubscriptionDetailsArgs {
  customerId: Stripe.Customer["id"];
  subscriptionStatus: SubscriptionStatus;
  datePaid?: Date;
  paymentPlanId?: PaymentPlanId;
}

export function updateUserSubscriptionDetails(
  {
    customerId,
    paymentPlanId,
    subscriptionStatus,
    datePaid,
  }: UpdateUserSubscriptionDetailsArgs,
  userDelegate: PrismaClient["user"],
): Promise<User> {
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
