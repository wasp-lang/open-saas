import * as z from "zod";

export const paymentPlansSchema = z.object({
  PAYMENTS_STARTER_SUBSCRIPTION_PLAN_ID: z.string({
    error: "PAYMENTS_STARTER_SUBSCRIPTION_PLAN_ID is required",
  }),
  PAYMENTS_PROFESSIONAL_SUBSCRIPTION_PLAN_ID: z.string({
    error: "PAYMENTS_PROFESSIONAL_SUBSCRIPTION_PLAN_ID is required",
  }),
  PAYMENTS_ENTERPRISE_SUBSCRIPTION_PLAN_ID: z.string({
    error: "PAYMENTS_ENTERPRISE_SUBSCRIPTION_PLAN_ID is required",
  }),
  PAYMENTS_CREDITS_25_PLAN_ID: z.string({
    error: "PAYMENTS_CREDITS_25_PLAN_ID is required",
  }),
  PAYMENTS_CREDITS_100_PLAN_ID: z.string({
    error: "PAYMENTS_CREDITS_100_PLAN_ID is required",
  }),
  PAYMENTS_CREDITS_500_PLAN_ID: z.string({
    error: "PAYMENTS_CREDITS_500_PLAN_ID is required",
  }),
});
