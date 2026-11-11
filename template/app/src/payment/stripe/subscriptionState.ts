import type Stripe from "stripe";
import { findPaymentPlanIdByPaymentProcessorPlanId } from "../paymentProcessorPlans";
import { SubscriptionStatus } from "../plans";
import {
  type FetchSubscriptionState,
  selectCurrentSubscriptionState,
  type SubscriptionState,
} from "../subscription";
import { stripeApi } from "./stripeApi";

export const fetchStripeSubscriptionState: FetchSubscriptionState = async (
  customerId,
) => {
  // Stripe returns subscriptions from newest to oldest.
  const subscriptions = await stripeApi.subscriptions.list({
    customer: customerId,
    status: "all",
  });

  return selectCurrentSubscriptionState(
    subscriptions.data.map(getSubscriptionState),
  );
};

function getSubscriptionState(
  subscription: Stripe.Subscription,
): SubscriptionState | null {
  // We only expect one subscription item.
  // If your workflow expects more, you should change this function to handle them.
  const subscriptionItem = subscription.items.data.at(0);
  if (!subscriptionItem) {
    return null;
  }

  const status = stripeToOpenSaasSubscriptionStatus[subscription.status];
  const paymentPlanId = findPaymentPlanIdByPaymentProcessorPlanId(
    subscriptionItem.price.id,
  );
  if (!status || !paymentPlanId) {
    return null;
  }

  return {
    status,
    paymentPlanId,
    // Stripe returns timestamps in seconds (Unix time),
    // so we multiply by 1000 to convert to milliseconds.
    currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

const stripeToOpenSaasSubscriptionStatus: Record<
  Stripe.Subscription.Status,
  SubscriptionStatus | null
> = {
  trialing: SubscriptionStatus.Trialing,
  active: SubscriptionStatus.Active,
  past_due: SubscriptionStatus.PastDue,
  paused: SubscriptionStatus.Paused,
  canceled: SubscriptionStatus.Canceled,
  unpaid: SubscriptionStatus.Canceled,
  // The first payment failed, so the subscription never started.
  incomplete: null,
  incomplete_expired: null,
};
