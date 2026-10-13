import type { ClientPaymentProcessor } from "../clientPaymentProcessor";
import { redirectToCheckout } from "../redirectToCheckout";

export const stripeClientPaymentProcessor: ClientPaymentProcessor = {
  id: "stripe",
  openCheckout: redirectToCheckout,
};
