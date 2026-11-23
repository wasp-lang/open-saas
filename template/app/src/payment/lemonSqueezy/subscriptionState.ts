import { getCustomer } from "@lemonsqueezy/lemonsqueezy.js";
import { findPaymentPlanIdByPaymentProcessorPlanId } from "../paymentProcessorPlans";
import { SubscriptionStatus } from "../plans";
import {
  type FetchSubscriptionState,
  selectCurrentSubscriptionState,
  type SubscriptionState,
} from "../subscription";
import type { LemonSqueezySubscription } from "./lemonSqueezyTypes";

export const fetchLemonSqueezySubscriptionState: FetchSubscriptionState =
  async (customerId) => {
    // Lemon Squeezy can't filter subscriptions by customer,
    // so we fetch the customer together with their subscriptions.
    const { data: customer, error } = await getCustomer(customerId, {
      include: ["subscriptions"],
    });
    if (error) {
      throw error;
    }

    const subscriptions = (customer.included ?? []).filter(isSubscription);

    return selectCurrentSubscriptionState(
      subscriptions.sort(compareNewestFirst).map(getSubscriptionState),
    );
  };

/**
 * The SDK doesn't type the resources included in a response.
 */
function isSubscription(resource: {
  type: string;
}): resource is LemonSqueezySubscription {
  return resource.type === "subscriptions";
}

function compareNewestFirst(
  a: LemonSqueezySubscription,
  b: LemonSqueezySubscription,
): number {
  return (
    new Date(b.attributes.created_at).getTime() -
    new Date(a.attributes.created_at).getTime()
  );
}

function getSubscriptionState({
  attributes: subscription,
}: LemonSqueezySubscription): SubscriptionState | null {
  const status = lemonSqueezyToOpenSaasSubscriptionStatus[subscription.status];
  const paymentPlanId = findPaymentPlanIdByPaymentProcessorPlanId(
    subscription.variant_id.toString(),
  );
  if (!paymentPlanId) {
    return null;
  }

  // `ends_at` is only set for subscriptions that are ending.
  const currentPeriodEnd = subscription.ends_at ?? subscription.renews_at;

  return {
    status,
    paymentPlanId,
    currentPeriodEnd: new Date(currentPeriodEnd),
    cancelAtPeriodEnd: subscription.status === "cancelled",
  };
}

const lemonSqueezyToOpenSaasSubscriptionStatus: Record<
  LemonSqueezySubscription["attributes"]["status"],
  SubscriptionStatus
> = {
  on_trial: SubscriptionStatus.Trialing,
  active: SubscriptionStatus.Active,
  // `cancelled` subscriptions stay valid until the billing period ends, then become `expired`.
  cancelled: SubscriptionStatus.Active,
  past_due: SubscriptionStatus.PastDue,
  paused: SubscriptionStatus.Paused,
  // The SDK's status type also lists `pause`, which the API docs don't mention.
  pause: SubscriptionStatus.Paused,
  unpaid: SubscriptionStatus.Canceled,
  expired: SubscriptionStatus.Canceled,
};
