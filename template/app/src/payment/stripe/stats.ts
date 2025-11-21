import Stripe from "stripe";
import { stripeClient } from "./stripeClient";

export async function fetchTotalStripeRevenue() {
  let totalRevenue = 0;
  let hasNextPage = true;
  let currentLastId: undefined | Stripe.BalanceTransaction["id"];

  while (hasNextPage) {
    const balanceTransactions = await stripeClient.balanceTransactions.list({
      limit: 100,
      type: "charge",
      starting_after: currentLastId,
    });

    for (const transaction of balanceTransactions.data) {
      totalRevenue += transaction.amount;
    }

    hasNextPage = balanceTransactions.has_more;
    currentLastId = balanceTransactions.data.at(-1)?.id;
  }

  // Revenue is in cents so we convert to dollars (or your main currency unit)
  return totalRevenue / 100;
}
