import type { CheckoutSession, PaymentProcessorId } from "./paymentProcessor";
import { stripeClientPaymentProcessor } from "./stripe/clientPaymentProcessor";

/**
 * The client-side part of a payment processor, which opens the checkout
 * session created by the server-side payment processor.
 */
export interface ClientPaymentProcessor {
  id: PaymentProcessorId;
  openCheckout: (session: CheckoutSession) => Promise<void>;
}

/**
 * Choose the same payment processor as in `src/payment/paymentProcessor.ts`.
 */
export const clientPaymentProcessor: ClientPaymentProcessor =
  stripeClientPaymentProcessor;
// export const clientPaymentProcessor: ClientPaymentProcessor = lemonSqueezyClientPaymentProcessor;
// export const clientPaymentProcessor: ClientPaymentProcessor = polarClientPaymentProcessor;
// export const clientPaymentProcessor: ClientPaymentProcessor = paddleClientPaymentProcessor;
