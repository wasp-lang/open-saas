import type { PaymentProcessorClient } from "../paymentProcessorClient";
import { redirectToCheckout } from "../redirectToCheckout";

export const polarPaymentProcessorClient: PaymentProcessorClient = {
  id: "polar",
  openCheckout: redirectToCheckout,
};
