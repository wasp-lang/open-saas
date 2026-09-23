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

// Paddle's Metrics API only allows a 3-year lookback, so total revenue is
// reported over (just under) the last 3 years rather than all-time.
const PADDLE_REVENUE_MAX_LOOKBACK_YEARS = 3;

function getRevenueWindow(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - PADDLE_REVENUE_MAX_LOOKBACK_YEARS);
  // Stay just inside the allowed window to avoid an "earlier than max lookback" error.
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

    // The client opens the Paddle.js checkout overlay with `id` (the
    // transaction id); `url` is the default-payment-link URL, kept for parity
    // with the other processors' redirect contract.
    return {
      session: {
        id: transaction.id,
        url: transaction.checkout?.url ?? "",
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
    // Paddle's Metrics API returns revenue as a daily timeseries; we sum the
    // datapoints over the max allowed window to get total collected revenue.
    // NOTE: this is net revenue (after tax & fees, before refunds/chargebacks).
    const { from, to } = getRevenueWindow();
    const revenue = await paddleClient.metrics.getRevenue({ from, to });

    const totalInMinorUnits = revenue.timeseries.reduce(
      (sum, datapoint) => sum + parseInt(datapoint.amount, 10),
      0,
    );

    // Revenue is in the currency's smallest unit (e.g. cents), so convert to
    // the main unit (e.g. dollars).
    return totalInMinorUnits / 100;
  },
};
