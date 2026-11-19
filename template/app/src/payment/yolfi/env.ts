import * as z from "zod";

// Optional while another provider is selected. The Yolfi adapter requires these
// when used, without imposing new configuration on existing Stripe users.
export const yolfiEnvSchema = z.object({
  YOLFI_API_KEY: z.string().min(1).optional(),
  ["YOLFI_WEBHOOK_SECRET"]: z.string().min(1).optional(),
});
