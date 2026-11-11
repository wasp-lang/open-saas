/**
 * The payment processor owns the subscription. `User` holds a copy of it.
 *
 * Webhook events can arrive late, twice or out of order, so we don't build
 * that copy from their payloads. Every event that can change a subscription
 * calls `syncUserSubscription`, which fetches the subscription again and
 * overwrites the copy.
 *
 * Based on https://github.com/t3dotgg/stripe-recommendations
 */
import type { User } from "wasp/entities";
import type { PrismaClient } from "wasp/server";
import { emailSender } from "wasp/server/email";
import {
  hasActiveSubscription,
  type PaymentPlanId,
  type SubscriptionStatus,
} from "./plans";

type PaymentProcessorUserId = NonNullable<User["paymentProcessorUserId"]>;

/**
 * A subscription as the app sees it.
 */
export interface SubscriptionState {
  status: SubscriptionStatus;
  paymentPlanId: PaymentPlanId;
  // The subscription renews on this date, or ends on it if `cancelAtPeriodEnd` is set.
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * Returns `null` if the customer has no subscription.
 */
export type FetchSubscriptionState = (
  paymentProcessorUserId: PaymentProcessorUserId,
) => Promise<SubscriptionState | null>;

export async function syncUserSubscription(
  paymentProcessorUserId: PaymentProcessorUserId,
  fetchSubscriptionState: FetchSubscriptionState,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  const subscriptionState = await fetchSubscriptionState(
    paymentProcessorUserId,
  );

  const userBeforeSync = await userDelegate.findUniqueOrThrow({
    where: { paymentProcessorUserId },
  });
  const user = await updateUserSubscription(
    paymentProcessorUserId,
    subscriptionState,
    userDelegate,
  );

  const hasUserJustCanceled =
    hasActiveSubscription(user) &&
    user.cancelAtPeriodEnd &&
    !userBeforeSync.cancelAtPeriodEnd;
  if (hasUserJustCanceled && user.email) {
    await emailSender.send({
      to: user.email,
      subject: "We hate to see you go :(",
      text: "We hate to see you go. Here is a sweet offer...",
      html: "We hate to see you go. Here is a sweet offer...",
    });
  }
}

function updateUserSubscription(
  paymentProcessorUserId: PaymentProcessorUserId,
  subscriptionState: SubscriptionState | null,
  userDelegate: PrismaClient["user"],
): Promise<User> {
  return userDelegate.update({
    where: { paymentProcessorUserId },
    data: {
      subscriptionStatus: subscriptionState?.status ?? null,
      subscriptionPlan: subscriptionState?.paymentPlanId ?? null,
      currentPeriodEnd: subscriptionState?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: subscriptionState?.cancelAtPeriodEnd ?? false,
    },
  });
}

/**
 * Expects subscriptions ordered from newest to oldest.
 *
 * A customer can have an old canceled subscription next to a new one,
 * so an active subscription wins over the rest.
 */
export function selectCurrentSubscriptionState(
  subscriptionStates: (SubscriptionState | null)[],
): SubscriptionState | null {
  const existingSubscriptionStates = subscriptionStates.filter(
    (subscriptionState) => subscriptionState !== null,
  );

  const activeSubscriptionState = existingSubscriptionStates.find(
    ({ status }) => hasActiveSubscription({ subscriptionStatus: status }),
  );
  if (activeSubscriptionState) {
    return activeSubscriptionState;
  }

  const newestSubscriptionState = existingSubscriptionStates.at(0);
  if (newestSubscriptionState) {
    return newestSubscriptionState;
  }

  return null;
}
