import type { PrismaClient } from '@prisma/client';
import type { PaymentPlanId, SubscriptionStatus } from '../plans';

export interface UpdateUserPaddlePaymentDetailsArgs {
  paddleCustomerId: string;
  userId?: string;
  subscriptionPlan?: PaymentPlanId;
  subscriptionStatus?: SubscriptionStatus;
  numOfCreditsPurchased?: number;
  datePaid?: Date;
}

/**
 * Updates the user's payment details in the database after a successful Paddle payment or subscription change.
 */
export async function updateUserPaddlePaymentDetails(
  args: UpdateUserPaddlePaymentDetailsArgs,
  prismaUserDelegate: PrismaClient['user']
) {
  const {
    paddleCustomerId,
    userId,
    subscriptionPlan,
    subscriptionStatus,
    numOfCreditsPurchased,
    datePaid,
  } = args;

  // Find user by paddleCustomerId first, then by userId as fallback
  let user = await prismaUserDelegate.findFirst({
    where: {
      paymentProcessorUserId: paddleCustomerId,
    },
  });

  if (!user && userId) {
    user = await prismaUserDelegate.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
  }

  if (!user) {
    throw new Error(`User not found for Paddle customer ID: ${paddleCustomerId}`);
  }

  const updateData: any = {
    paymentProcessorUserId: paddleCustomerId,
  };

  if (subscriptionPlan !== undefined) {
    updateData.subscriptionPlan = subscriptionPlan;
  }

  if (subscriptionStatus !== undefined) {
    updateData.subscriptionStatus = subscriptionStatus;
  }

  if (numOfCreditsPurchased !== undefined) {
    updateData.credits = {
      increment: numOfCreditsPurchased,
    };
  }

  if (datePaid !== undefined) {
    updateData.datePaid = datePaid;
  }

  return await prismaUserDelegate.update({
    where: {
      id: user.id,
    },
    data: updateData,
  });
}