import { type Customer, type Transaction } from "@paddle/paddle-node-sdk";
import { paddleClient } from "./paddleClient";

/**
 * Returns a Paddle customer for the given User email, creating a customer if none exist.
 *
 * NOTE: Paddle enforces unique emails across both active and archived customers,
 *       so an archived customer is reactivated instead of creating a new one.
 */
export async function ensurePaddleCustomer(
  userEmail: string,
): Promise<Customer> {
  const [customer] = await paddleClient.customers
    .list({ email: [userEmail], status: ["active", "archived"], perPage: 1 })
    .next();

  if (!customer) {
    return paddleClient.customers.create({ email: userEmail });
  } else if (customer.status === "archived") {
    return paddleClient.customers.update(customer.id, { status: "active" });
  } else {
    return customer;
  }
}

interface CreatePaddleTransactionArgs {
  priceId: string;
  customerId: string;
  userId: string;
}

export function createPaddleTransaction({
  priceId,
  customerId,
  userId,
}: CreatePaddleTransactionArgs): Promise<Transaction> {
  return paddleClient.transactions.create({
    items: [{ priceId, quantity: 1 }],
    customerId,
    customData: { userId },
  });
}
