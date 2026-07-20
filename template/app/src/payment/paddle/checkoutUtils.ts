import { type Customer, type Transaction } from "@paddle/paddle-node-sdk";
import { paddleClient } from "./paddleClient";

/**
 * Returns a Paddle customer for the given email, creating one if none exist.
 *
 * NOTE: Paddle enforces unique customer emails across BOTH active and archived
 * customers, but `customers.list` returns only active customers by default. We
 * therefore search both statuses — otherwise a returning customer whose record was
 * archived would fall through to `create` and fail with `customer_already_exists`.
 * If the match is archived, we reactivate it so it can be used for checkout.
 */
export async function ensurePaddleCustomer(
  userEmail: string,
): Promise<Customer> {
  const existingCustomers = await paddleClient.customers
    .list({ email: [userEmail], status: ["active", "archived"] })
    .next();

  if (existingCustomers.length > 0) {
    const customer = existingCustomers[0];
    if (customer.status === "archived") {
      return paddleClient.customers.update(customer.id, { status: "active" });
    }
    return customer;
  }

  return paddleClient.customers.create({ email: userEmail });
}

interface CreatePaddleTransactionArgs {
  priceId: string;
  customerId: string;
  userId: string;
}

/**
 * Creates a Paddle transaction for the given price and customer. The returned
 * transaction id is handed to Paddle.js on the client to open the checkout
 * overlay; `userId` is stored as custom data so it flows through to the
 * resulting transaction and subscription webhook events.
 */
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
