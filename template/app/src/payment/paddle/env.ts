import * as z from "zod";
import { paymentPlansSchema } from "../env";

export const paddleEnvSchema = paymentPlansSchema.extend({
  PADDLE_API_KEY: z.string({ error: "PADDLE_API_KEY is required" }),
  PADDLE_WEBHOOK_SECRET: z.string({
    error: "PADDLE_WEBHOOK_SECRET is required",
  }),
  PADDLE_SANDBOX_MODE: z.string({ error: "PADDLE_SANDBOX_MODE is required" }),
});
