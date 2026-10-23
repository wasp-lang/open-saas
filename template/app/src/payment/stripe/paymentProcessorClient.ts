import type { PaymentProcessorClient } from "../paymentProcessorClient";
import { redirectToCheckout } from "../redirectToCheckout";

export const stripePaymentProcessorClient: PaymentProcessorClient = {
  id: "stripe",
  openCheckout: redirectToCheckout,
};
