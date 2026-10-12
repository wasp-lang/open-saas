import type { CheckoutSession } from "./paymentProcessor";

/**
 * Opens a hosted checkout page, for payment processors that return
 * a `redirect` checkout session.
 */
export async function redirectToCheckout(
  session: CheckoutSession,
): Promise<void> {
  if (session.kind !== "redirect") {
    throw new Error("Checkout session has no URL to redirect to");
  }
  window.open(session.url, "_self");
}
