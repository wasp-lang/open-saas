import type { PrismaClient } from '@prisma/client';
import type { SubscriptionStatus, PaymentPlanId } from '../plans';

export interface UpdateUserPolarPaymentDetailsArgs {
  polarCustomerId: string;
  subscriptionPlan?: PaymentPlanId;
  subscriptionStatus?: SubscriptionStatus | string;
  numOfCreditsPurchased?: number;
  datePaid?: Date;
}

export const updateUserPolarPaymentDetails = async (
  args: UpdateUserPolarPaymentDetailsArgs,
  userDelegate: PrismaClient['user']
) => {
  const {
    polarCustomerId,
    subscriptionPlan,
    subscriptionStatus,
    numOfCreditsPurchased,
    datePaid,
  } = args;

  return await userDelegate.update({
    where: {
      paymentProcessorUserId: polarCustomerId
    },
    data: {
      paymentProcessorUserId: polarCustomerId,
      subscriptionPlan,
      subscriptionStatus,
      datePaid,
      credits: numOfCreditsPurchased !== undefined 
        ? { increment: numOfCreditsPurchased } 
        : undefined,
    },
  });
};

export const findUserByPolarCustomerId = async (
  polarCustomerId: string,
  userDelegate: PrismaClient['user']
) => {
  return await userDelegate.findFirst({
    where: {
      paymentProcessorUserId: polarCustomerId
    }
  });
};

export const updateUserSubscriptionStatus = async (
  polarCustomerId: string,
  subscriptionStatus: SubscriptionStatus | string,
  userDelegate: PrismaClient['user']
) => {
  return await userDelegate.update({
    where: {
      paymentProcessorUserId: polarCustomerId
    },
    data: {
      subscriptionStatus,
    },
  });
};

export const addCreditsToUser = async (
  polarCustomerId: string,
  creditsAmount: number,
  userDelegate: PrismaClient['user']
) => {
  return await userDelegate.update({
    where: {
      paymentProcessorUserId: polarCustomerId
    },
    data: {
      credits: { increment: creditsAmount },
      datePaid: new Date(),
    },
  });
}; 