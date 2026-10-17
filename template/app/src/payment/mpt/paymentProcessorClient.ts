import type { PaymentProcessorClient } from "../paymentProcessorClient";
import { redirectToCheckout } from "../redirectToCheckout";

export const mptPaymentProcessorClient: PaymentProcessorClient = {
  id: "mpt",
  openCheckout: redirectToCheckout,
};
