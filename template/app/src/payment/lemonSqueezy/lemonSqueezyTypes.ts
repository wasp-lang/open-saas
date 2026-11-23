import type {
  Order,
  Subscription,
  SubscriptionInvoice,
} from "@lemonsqueezy/lemonsqueezy.js";

// The SDK only exports API response types, which wrap the resource in `data`.
export type LemonSqueezyOrder = Order["data"];
export type LemonSqueezySubscription = Subscription["data"];
export type LemonSqueezySubscriptionInvoice = SubscriptionInvoice["data"];
