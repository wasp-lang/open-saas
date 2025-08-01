/**
 * All supported payment processors
 */
export enum PaymentProcessors {
  Stripe = 'Stripe',
  LemonSqueezy = 'LemonSqueezy',
  Polar = 'Polar',
}

/**
 * All supported payment processor identifiers
 */
export type PaymentProcessorId = `${PaymentProcessors}`;
