import { Checkout } from "@polar-sh/sdk/models/components/checkout.js";
import { Customer } from "@polar-sh/sdk/models/components/customer.js";
import { config } from "wasp/server";
import { polarClient } from "./polarClient";

export async function ensurePolarCustomer(
  userId: string,
  userEmail: string,
): Promise<Customer> {
  try {
    const existingCustomer = await polarClient.customers.getExternal({
      externalId: userId,
    });

    if (existingCustomer) {
      console.log("Using an existing Polar customer");
      return existingCustomer;
    }
  } catch (error) {
    // FIXME: we might create a new customer on other errors too
  }

  console.log("Creating a new Polar customer");
  return polarClient.customers.create({
    externalId: userId,
    email: userEmail,
  });
}

interface CreatePolarCheckoutSessionArgs {
  productId: string;
  customerId: string;
}

export function createPolarCheckoutSession({
  productId,
  customerId,
}: CreatePolarCheckoutSessionArgs): Promise<Checkout> {
  return polarClient.checkouts.create({
    products: [productId],
    successUrl: `${config.frontendUrl}/checkout?success=true`,
    metadata: {
      source: config.frontendUrl,
    },
    customerId,
  });
}
