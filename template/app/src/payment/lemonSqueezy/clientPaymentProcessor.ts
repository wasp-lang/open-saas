import type { ClientPaymentProcessor } from "../clientPaymentProcessor";
import { redirectToCheckout } from "../redirectToCheckout";

export const lemonSqueezyClientPaymentProcessor: ClientPaymentProcessor = {
  id: "lemonsqueezy",
  openCheckout: redirectToCheckout,
};
