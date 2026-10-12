import type { ClientPaymentProcessor } from "../clientPaymentProcessor";
import { redirectToCheckout } from "../redirectToCheckout";

export const polarClientPaymentProcessor: ClientPaymentProcessor = {
  id: "polar",
  openCheckout: redirectToCheckout,
};
