import * as z from "zod";

export const underwritingEnvSchema = z.object({
  OPENAI_API_KEY: z.string({
    error: "OPENAI_API_KEY is required for Underwrite AI",
  }),
});
