import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import type { SubscriptionStatus as PolarSubscriptionStatus } from "@polar-sh/sdk/models/components/subscriptionstatus.js";
import { findPaymentPlanIdByPaymentProcessorPlanId } from "../paymentProcessorPlans";
import { SubscriptionStatus } from "../plans";
import {
  type FetchSubscriptionState,
  selectCurrentSubscriptionState,
  type SubscriptionState,
} from "../subscription";
import { polarApi } from "./polarApi";

export const fetchPolarSubscriptionState: FetchSubscriptionState = async (
  customerId,
) => {
  const subscriptions = await polarApi.subscriptions.list({
    customerId,
    sorting: ["-started_at"],
  });

  return selectCurrentSubscriptionState(
    subscriptions.result.items.map(getSubscriptionState),
  );
};

function getSubscriptionState(
  subscription: Subscription,
): SubscriptionState | null {
  const status = polarToOpenSaasSubscriptionStatus[subscription.status];
  const paymentPlanId = findPaymentPlanIdByPaymentProcessorPlanId(
    subscription.productId,
  );
  if (!status || !paymentPlanId) {
    return null;
  }

  return {
    status,
    paymentPlanId,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

const polarToOpenSaasSubscriptionStatus: Record<
  PolarSubscriptionStatus,
  SubscriptionStatus | null
> = {
  trialing: SubscriptionStatus.Trialing,
  active: SubscriptionStatus.Active,
  past_due: SubscriptionStatus.PastDue,
  canceled: SubscriptionStatus.Canceled,
  unpaid: SubscriptionStatus.Canceled,
  // The first payment failed, so the subscription never started.
  incomplete: null,
  incomplete_expired: null,
};
