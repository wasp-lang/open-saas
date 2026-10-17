import { routes } from "wasp/client/router";
import { config } from "wasp/server";
import { CheckoutResult } from "./checkoutResult";

const CHECKOUT_SUCCESS_URL_PATH = routes.CheckoutResultRoute.build({
  search: {
    status: CheckoutResult.Success,
  },
});
export const CHECKOUT_SUCCESS_URL = `${config.frontendUrl}${CHECKOUT_SUCCESS_URL_PATH}`;

const CHECKOUT_CANCELED_URL_PATH = routes.CheckoutResultRoute.build({
  search: {
    status: CheckoutResult.Canceled,
  },
});
export const CHECKOUT_CANCELED_URL = `${config.frontendUrl}${CHECKOUT_CANCELED_URL_PATH}`;

/**
 * For processors that confirm a payment by `sessionId` instead of reporting
 * the result in the redirect, see `PaymentProcessor.confirmCheckoutSession`.
 */
export function getCheckoutConfirmationUrl(sessionId: string): string {
  const path = routes.CheckoutResultRoute.build({
    search: { session_id: sessionId },
  });
  return `${config.frontendUrl}${path}`;
}

export const CUSTOMER_PORTAL_RETURN_URL = `${config.frontendUrl}${routes.AccountRoute.to}`;
