import type { PaymentProcessorClient } from "../paymentProcessorClient";
import { redirectToCheckout } from "../redirectToCheckout";

export const lemonSqueezyPaymentProcessorClient: PaymentProcessorClient = {
  id: "lemonsqueezy",
  openCheckout: redirectToCheckout,
};
