import type { CheckoutSession, PaymentProcessorId } from "./paymentProcessor";
import { stripePaymentProcessorClient } from "./stripe/paymentProcessorClient";

/**
 * The client-side part of a payment processor, which opens the checkout
 * session created by the server-side payment processor.
 */
export interface PaymentProcessorClient {
  id: PaymentProcessorId;
  openCheckout: (session: CheckoutSession) => Promise<void>;
}

/**
 * Choose the same payment processor as in `src/payment/paymentProcessor.ts`.
 */
export const paymentProcessorClient: PaymentProcessorClient =
  stripePaymentProcessorClient;
// export const paymentProcessorClient: PaymentProcessorClient = lemonSqueezyPaymentProcessorClient;
// export const paymentProcessorClient: PaymentProcessorClient = polarPaymentProcessorClient;
// export const paymentProcessorClient: PaymentProcessorClient = paddlePaymentProcessorClient;
