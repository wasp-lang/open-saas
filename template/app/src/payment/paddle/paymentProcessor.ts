import {
  type CreateCheckoutSessionArgs,
  type FetchCustomerPortalUrlArgs,
  type PaymentProcessor,
} from "../paymentProcessor";
import { getPaymentProcessorPlanId } from "../paymentProcessorPlans";
import {
  fetchUserPaymentProcessorUserId,
  updateUserPaymentProcessorUserId,
} from "../user";
import { createPaddleTransaction, ensurePaddleCustomer } from "./checkoutUtils";
import { paddleClient } from "./paddleClient";
import { paddleMiddlewareConfigFn, paddleWebhook } from "./webhook";

// Paddle's Metrics API only allows a 3-year lookback, so total revenue
// is reported over the last 3 years rather than all-time.
const PADDLE_REVENUE_MAX_LOOKBACK_YEARS = 3;

function getRevenueWindow(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - PADDLE_REVENUE_MAX_LOOKBACK_YEARS);
  from.setDate(from.getDate() + 1);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export const paddlePaymentProcessor: PaymentProcessor = {
  id: "paddle",
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate,
  }: CreateCheckoutSessionArgs) => {
    const customer = await ensurePaddleCustomer(userEmail);

    await updateUserPaymentProcessorUserId(
      { userId, paymentProcessorUserId: customer.id },
      prismaUserDelegate,
    );

    const transaction = await createPaddleTransaction({
      priceId: getPaymentProcessorPlanId(paymentPlan),
      customerId: customer.id,
      userId,
    });

    return {
      session: {
        kind: "inPage",
        id: transaction.id,
      },
    };
  },
  fetchCustomerPortalUrl: async ({
    userId,
    prismaUserDelegate,
  }: FetchCustomerPortalUrlArgs) => {
    const paymentProcessorUserId = await fetchUserPaymentProcessorUserId(
      userId,
      prismaUserDelegate,
    );

    if (!paymentProcessorUserId) {
      return null;
    }

    const portalSession = await paddleClient.customerPortalSessions.create(
      paymentProcessorUserId,
      [],
    );

    return portalSession.urls.general.overview;
  },
  webhook: paddleWebhook,
  webhookMiddlewareConfigFn: paddleMiddlewareConfigFn,
  fetchTotalRevenue: async () => {
    // NOTE: Paddle reports net revenue (after tax and fees).
    const { from, to } = getRevenueWindow();
    const revenue = await paddleClient.metrics.getRevenue({ from, to });

    const totalInMinorUnits = revenue.timeseries.reduce(
      (sum, datapoint) => sum + parseInt(datapoint.amount, 10),
      0,
    );

    // Revenue is in cents so we convert to dollars (or your main currency unit)
    return totalInMinorUnits / 100;
  },
};
