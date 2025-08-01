import type { PrismaClient } from '@prisma/client';
import type { SubscriptionStatus, PaymentPlanId } from '../plans';

/**
 * Arguments for updating user Polar payment details
 */
export interface UpdateUserPolarPaymentDetailsArgs {
  polarCustomerId: string;
  subscriptionPlan?: PaymentPlanId;
  subscriptionStatus?: SubscriptionStatus | string;
  numOfCreditsPurchased?: number;
  datePaid?: Date;
}

/**
 * Updates user Polar payment details
 * @param args Arguments for updating user Polar payment details
 * @param args.polarCustomerId ID of the Polar customer
 * @param args.subscriptionPlan ID of the subscription plan
 * @param args.subscriptionStatus Status of the subscription
 * @param args.numOfCreditsPurchased Number of credits purchased
 * @param args.datePaid Date of payment
 * @param userDelegate Prisma user delegate for database operations
 * @returns Promise resolving to the updated user
 */
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

  try {
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
  } catch (error) {
    console.error('Error updating user Polar payment details:', error);
    throw new Error(`Failed to update user payment details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Finds a user by their Polar customer ID
 * @param polarCustomerId ID of the Polar customer
 * @param userDelegate Prisma user delegate for database operations
 * @returns Promise resolving to the user or null if not found
 */
export const findUserByPolarCustomerId = async (
  polarCustomerId: string,
  userDelegate: PrismaClient['user']
) => {
  try {
    return await userDelegate.findFirst({
      where: {
        paymentProcessorUserId: polarCustomerId
      }
    });
  } catch (error) {
    console.error('Error finding user by Polar customer ID:', error);
    throw new Error(`Failed to find user by Polar customer ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Updates the subscription status of a user
 * @param polarCustomerId ID of the Polar customer
 * @param subscriptionStatus Status of the subscription
 * @param userDelegate Prisma user delegate for database operations
 * @returns Promise resolving to the updated user
 */
export const updateUserSubscriptionStatus = async (
  polarCustomerId: string,
  subscriptionStatus: SubscriptionStatus | string,
  userDelegate: PrismaClient['user']
) => {
  try {
    return await userDelegate.update({
      where: {
        paymentProcessorUserId: polarCustomerId
      },
      data: {
        subscriptionStatus,
      },
    });
  } catch (error) {
    console.error('Error updating user subscription status:', error);
    throw new Error(`Failed to update subscription status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Adds credits to a user
 * @param polarCustomerId ID of the Polar customer
 * @param creditsAmount Amount of credits to add
 * @param userDelegate Prisma user delegate for database operations
 * @returns Promise resolving to the updated user
 */
export const addCreditsToUser = async (
  polarCustomerId: string,
  creditsAmount: number,
  userDelegate: PrismaClient['user']
) => {
  try {
    return await userDelegate.update({
      where: {
        paymentProcessorUserId: polarCustomerId
      },
      data: {
        credits: { increment: creditsAmount },
        datePaid: new Date(),
      },
    });
  } catch (error) {
    console.error('Error adding credits to user:', error);
    throw new Error(`Failed to add credits to user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 