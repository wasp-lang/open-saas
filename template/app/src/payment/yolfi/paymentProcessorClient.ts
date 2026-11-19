import type { PaymentProcessorClient } from "../paymentProcessorClient";
import { redirectToCheckout } from "../redirectToCheckout";

export const yolfiPaymentProcessorClient: PaymentProcessorClient = {
  id: "yolfi",
  openCheckout: redirectToCheckout,
};
