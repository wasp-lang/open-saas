import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import type { SubscriptionStatus } from '../plans';
import { PaymentPlanId } from '../plans';

export async function updateUserStripePaymentDetails(
  paymentDetails: UpdateUserStripeOneTimePaymentDetails | UpdateUserStripeSubscriptionDetails,
  userDelegate: PrismaClient['user']
) {
  if ('numOfCreditsPurchased' in paymentDetails) {
    return updateUserStripeOneTimePaymentDetails(paymentDetails, userDelegate);
  } else {
    return updateUserStripeSubscriptionDetails(paymentDetails, userDelegate);
  }
}

interface UpdateUserStripeOneTimePaymentDetails {
  customerId: Stripe.Customer['id'];
  datePaid: Date;
  numOfCreditsPurchased: number;
}

function updateUserStripeOneTimePaymentDetails(
  { customerId, datePaid, numOfCreditsPurchased }: UpdateUserStripeOneTimePaymentDetails,
  userDelegate: PrismaClient['user']
) {
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

interface UpdateUserStripeSubscriptionDetails {
  customerId: Stripe.Customer['id'];
  subscriptionStatus: SubscriptionStatus;
  paymentPlanId?: PaymentPlanId;
  datePaid?: Date;
}

function updateUserStripeSubscriptionDetails(
  { customerId, paymentPlanId, subscriptionStatus, datePaid }: UpdateUserStripeSubscriptionDetails,
  userDelegate: PrismaClient['user']
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
