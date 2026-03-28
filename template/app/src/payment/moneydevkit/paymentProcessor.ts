import type {
  CreateCheckoutSessionArgs,
  FetchCustomerPortalUrlArgs,
  PaymentProcessor,
} from "../paymentProcessor";
import { createMdkCheckoutSession } from "./checkoutUtils";
import { mdkMiddlewareConfigFn, mdkWebhook } from "./webhook";

export const moneydevkitPaymentProcessor: PaymentProcessor = {
  id: "moneydevkit",
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
  }: CreateCheckoutSessionArgs) => {
    const { url, id } = await createMdkCheckoutSession({
      productId: paymentPlan.getPaymentProcessorPlanId(),
      customerEmail: userEmail,
      userId,
    });

    return {
      session: {
        url,
        id,
      },
    };
  },
  fetchCustomerPortalUrl: async (
    _args: FetchCustomerPortalUrlArgs,
  ): Promise<string | null> => {
    // Lightning payments have no customer portal
    return null;
  },
  webhook: mdkWebhook,
  webhookMiddlewareConfigFn: mdkMiddlewareConfigFn,
  fetchTotalRevenue: async (): Promise<number> => {
    // TODO: Integrate with MDK API to fetch actual revenue
    return 0;
  },
};
