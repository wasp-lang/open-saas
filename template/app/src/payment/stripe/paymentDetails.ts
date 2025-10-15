import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import type { SubscriptionStatus } from "../plans";
import { PaymentPlanId } from "../plans";

interface UpdateUserStripeOneTimePaymentDetails {
  customerId: Stripe.Customer["id"];
  datePaid: Date;
  numOfCreditsPurchased: number;
}

export function updateUserStripeOneTimePaymentDetails(
  {
    customerId,
    datePaid,
    numOfCreditsPurchased,
  }: UpdateUserStripeOneTimePaymentDetails,
  userDelegate: PrismaClient["user"],
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
  customerId: Stripe.Customer["id"];
  datePaid?: Date;
  subscriptionStatus: SubscriptionStatus;
  paymentPlanId?: PaymentPlanId;
}

export function updateUserStripeSubscriptionDetails(
  {
    customerId,
    paymentPlanId,
    subscriptionStatus,
    datePaid,
  }: UpdateUserStripeSubscriptionDetails,
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
