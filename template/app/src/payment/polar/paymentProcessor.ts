import {
  type CreateCheckoutSessionArgs,
  type FetchCustomerPortalUrlArgs,
  type PaymentProcessor,
} from "../paymentProcessor";
import {
  fetchUserPaymentProcessorUserId,
  updateUserPaymentProcessorUserId,
} from "../user";
import {
  createPolarCheckoutSession,
  ensurePolarCustomer,
} from "./checkoutUtils";
import { polarClient } from "./polarClient";
import { polarMiddlewareConfigFn, polarWebhook } from "./webhook";

export const polarPaymentProcessor: PaymentProcessor = {
  id: "polar",
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
    prismaUserDelegate,
  }: CreateCheckoutSessionArgs) => {
    const customer = await ensurePolarCustomer(userId, userEmail);

    await updateUserPaymentProcessorUserId(
      { userId, paymentProcessorUserId: customer.id },
      prismaUserDelegate,
    );

    const checkoutSession = await createPolarCheckoutSession({
      productId: paymentPlan.getPaymentProcessorPlanId(),
      customerId: customer.id,
    });

    return {
      session: {
        id: checkoutSession.id,
        url: checkoutSession.url,
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

    const customerSession = await polarClient.customerSessions.create({
      customerId: paymentProcessorUserId,
    });

    return customerSession.customerPortalUrl;
  },
  webhook: polarWebhook,
  webhookMiddlewareConfigFn: polarMiddlewareConfigFn,
};
