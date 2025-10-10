import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
import { requireNodeEnvVar } from "../../server/utils";
import type {
  CreateCheckoutSessionArgs,
  FetchCustomerPortalUrlArgs,
  PaymentProcessor,
} from "../paymentProcessor";
import { createLemonSqueezyCheckoutSession } from "./checkoutUtils";
import { lemonSqueezyMiddlewareConfigFn, lemonSqueezyWebhook } from "./webhook";

lemonSqueezySetup({
  apiKey: requireNodeEnvVar("LEMONSQUEEZY_API_KEY"),
});

export const lemonSqueezyPaymentProcessor: PaymentProcessor = {
  id: "lemonsqueezy",
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
  }: CreateCheckoutSessionArgs) => {
    if (!userId)
      throw new Error(
        "User ID needed to create Lemon Squeezy Checkout Session",
      );
    const session = await createLemonSqueezyCheckoutSession({
      storeId: requireNodeEnvVar("LEMONSQUEEZY_STORE_ID"),
      variantId: paymentPlan.getPaymentProcessorPlanId(),
      userEmail,
      userId,
    });
    return { session };
  },
  fetchCustomerPortalUrl: async (args: FetchCustomerPortalUrlArgs) => {
    const user = await args.prismaUserDelegate.findUniqueOrThrow({
      where: {
        id: args.userId,
      },
      select: {
        lemonSqueezyCustomerPortalUrl: true,
      },
    });
    // Note that Lemon Squeezy assigns a unique URL to each user after the first successful payment.
    // This is handled in the Lemon Squeezy webhook.
    return user.lemonSqueezyCustomerPortalUrl;
  },
  webhook: lemonSqueezyWebhook,
  webhookMiddlewareConfigFn: lemonSqueezyMiddlewareConfigFn,
};
