/**
 * All supported payment processors
 */
export enum PaymentProcessors {
  Stripe = 'stripe',
  LemonSqueezy = 'lemonSqueezy',
  Polar = 'polar',
}

/**
 * All supported payment processor identifiers
 */
export type PaymentProcessorId = `${PaymentProcessors}`;
