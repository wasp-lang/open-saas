import Stripe from "stripe";
import { stripeClient } from "./stripeClient";

/**
 * Returns a Stripe customer for the given User email, creating a customer if none exist.
 * Implements email uniqueness logic since Stripe doesn't enforce unique emails.
 */
export async function ensureStripeCustomer(
  userEmail: string,
): Promise<Stripe.Customer> {
  const stripeCustomers = await stripeClient.customers.list({
    email: userEmail,
  });

  if (stripeCustomers.data.length === 0) {
    console.log("Creating a new Stripe customer");
    return stripeClient.customers.create({
      email: userEmail,
    });
  } else {
    console.log("Using an existing Stripe customer");
    return stripeCustomers.data[0];
  }
}

interface CreateStripeCheckoutSessionParams {
  priceId: Stripe.Price["id"];
  customerId: Stripe.Customer["id"];
  mode: Stripe.Checkout.Session.Mode;
}

export async function createStripeCheckoutSession({
  priceId,
  customerId,
  mode,
}: CreateStripeCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  // WASP_WEB_CLIENT_URL will be set up by Wasp when deploying to production: https://wasp.sh/docs/deploying
  const CLIENT_BASE_URL =
    process.env.WASP_WEB_CLIENT_URL || "http://localhost:3000";

  return await stripeClient.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode,
    success_url: `${CLIENT_BASE_URL}/checkout?status=success`,
    cancel_url: `${CLIENT_BASE_URL}/checkout?status=canceled`,
    automatic_tax: { enabled: true },
    allow_promotion_codes: true,
    customer_update: {
      address: "auto",
    },
    // Stripe automatically creates invoices for subscriptions.
    // For one-time payments, we must enable them manually.
    // However, enabling invoices for subscriptions will throw an error.
    invoice_creation:
      mode === "payment"
        ? {
            enabled: true,
          }
        : undefined,
  });
}
