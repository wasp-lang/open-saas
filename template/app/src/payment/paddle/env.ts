import * as z from "zod";
import { paymentPlansSchema } from "../env";

export const paddleEnvSchema = paymentPlansSchema.extend({
  PADDLE_API_KEY: z.string({ error: "PADDLE_API_KEY is required" }),
  PADDLE_WEBHOOK_SECRET: z.string({
    error: "PADDLE_WEBHOOK_SECRET is required",
  }),
  PADDLE_SANDBOX_MODE: z.string({ error: "PADDLE_SANDBOX_MODE is required" }),
});

export const paddleClientEnvSchema = z.object({
  REACT_APP_PADDLE_CLIENT_TOKEN: z.string({
    error: "REACT_APP_PADDLE_CLIENT_TOKEN is required",
  }),
  REACT_APP_PADDLE_SANDBOX_MODE: z.string({
    error: "REACT_APP_PADDLE_SANDBOX_MODE is required",
  }),
});
