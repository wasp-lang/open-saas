/**
 * Opens the checkout within the page (e.g. an overlay), for payment processors
 * that return an `inPage` checkout session.
 */
export type OpenInPageCheckout = (checkoutSessionId: string) => Promise<void>;

/**
 * If your payment processor uses an in-page checkout, choose it here
 * as well as in `src/payment/paymentProcessor.ts`.
 */
export const openInPageCheckout: OpenInPageCheckout | null = null;
// export const openInPageCheckout: OpenInPageCheckout | null = openPaddleCheckout;
