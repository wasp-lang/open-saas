import {
  getCustomer,
  getStore,
  lemonSqueezySetup,
} from "@lemonsqueezy/lemonsqueezy.js";
import { env } from "wasp/server";
import type {
  CreateCheckoutSessionArgs,
  FetchCustomerPortalUrlArgs,
  PaymentProcessor,
} from "../paymentProcessor";
import { getPaymentProcessorPlanId } from "../paymentProcessorPlans";
import { fetchUserPaymentProcessorUserId } from "../user";
import { createLemonSqueezyCheckout } from "./checkoutUtils";
import { fetchLemonSqueezySubscriptionState } from "./subscriptionState";
import { lemonSqueezyMiddlewareConfigFn, lemonSqueezyWebhook } from "./webhook";

lemonSqueezySetup({ apiKey: env.LEMONSQUEEZY_API_KEY });

export const lemonSqueezyPaymentProcessor: PaymentProcessor = {
  id: "lemonsqueezy",
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
  }: CreateCheckoutSessionArgs) => {
    const checkout = await createLemonSqueezyCheckout({
      variantId: getPaymentProcessorPlanId(paymentPlan),
      userId,
      userEmail,
    });

    return {
      session: {
        kind: "redirect",
        id: checkout.data.id,
        url: checkout.data.attributes.url,
      },
    };
  },
  fetchCustomerPortalUrl: async ({
    userId,
    prismaUserDelegate,
  }: FetchCustomerPortalUrlArgs) => {
    const paymentProcessorUserId = await fetchUserPaymentProcessorUserId(
      userId,
      prismaUserDelegate,
    );

    if (!paymentProcessorUserId) {
      return null;
    }

    // The portal URL is pre-signed and only valid for 24 hours, so we fetch a fresh one each time.
    // It is `null` for customers who never bought a subscription.
    const { data: customer, error } = await getCustomer(paymentProcessorUserId);
    if (error) {
      throw error;
    }

    return customer.data.attributes.urls.customer_portal;
  },
  fetchSubscriptionState: fetchLemonSqueezySubscriptionState,
  webhook: lemonSqueezyWebhook,
  webhookMiddlewareConfigFn: lemonSqueezyMiddlewareConfigFn,
  fetchTotalRevenue: async () => {
    // NOTE: Store revenue may not include test mode orders (or may be heavily delayed),
    // so it can show 0 while testing.
    const { data: store, error } = await getStore(env.LEMONSQUEEZY_STORE_ID);
    if (error) {
      throw error;
    }

    // Revenue is in USD cents so we convert to dollars
    return store.data.attributes.total_revenue / 100;
  },
};
