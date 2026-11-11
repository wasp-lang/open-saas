import type {
  SubscriptionStatus as PaddleSubscriptionStatus,
  Subscription,
} from "@paddle/paddle-node-sdk";
import { findPaymentPlanIdByPaymentProcessorPlanId } from "../paymentProcessorPlans";
import { SubscriptionStatus } from "../plans";
import {
  type FetchSubscriptionState,
  selectCurrentSubscriptionState,
  type SubscriptionState,
} from "../subscription";
import { paddleApi } from "./paddleApi";

export const fetchPaddleSubscriptionState: FetchSubscriptionState = async (
  customerId,
) => {
  const subscriptions = await paddleApi.subscriptions
    .list({ customerId: [customerId], orderBy: "id[DESC]" })
    .next();

  return selectCurrentSubscriptionState(
    subscriptions.map(getSubscriptionState),
  );
};

function getSubscriptionState(
  subscription: Subscription,
): SubscriptionState | null {
  // We only expect one subscription item.
  // If your workflow expects more, you should change this function to handle them.
  const subscriptionItem = subscription.items.at(0);
  const paymentPlanId =
    subscriptionItem &&
    findPaymentPlanIdByPaymentProcessorPlanId(subscriptionItem.price.id);
  if (!paymentPlanId) {
    return null;
  }

  const currentPeriodEnd = subscription.currentBillingPeriod?.endsAt;

  return {
    status: paddleToOpenSaasSubscriptionStatus[subscription.status],
    paymentPlanId,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : null,
    cancelAtPeriodEnd: subscription.scheduledChange?.action === "cancel",
  };
}

const paddleToOpenSaasSubscriptionStatus: Record<
  PaddleSubscriptionStatus,
  SubscriptionStatus
> = {
  trialing: SubscriptionStatus.Trialing,
  active: SubscriptionStatus.Active,
  past_due: SubscriptionStatus.PastDue,
  paused: SubscriptionStatus.Paused,
  canceled: SubscriptionStatus.Canceled,
};
