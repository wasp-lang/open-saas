import * as z from "zod";
import { paymentPlansSchema } from "../env";

export const mptEnvSchema = paymentPlansSchema.extend({
  MPT_API_URL: z.url({ error: "MPT_API_URL must be a URL" }),
  MPT_SECRET_KEY: z.string({ error: "MPT_SECRET_KEY is required" }),
  MPT_WEBHOOK_SECRET: z.string({ error: "MPT_WEBHOOK_SECRET is required" }),
  MPT_TARGET_ADDRESS: z
    .string({ error: "MPT_TARGET_ADDRESS is required" })
    .regex(/^0x[0-9a-fA-F]{40}$/, "MPT_TARGET_ADDRESS must be a 0x address"),
});
