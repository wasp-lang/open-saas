import * as z from "zod";

export const demoAiAppEnvSchema = z.object({
  OPENAI_API_KEY: z.string({
    error: "OPENAI_API_KEY is required for the demo AI app",
  }),
  // Optional, for OpenAI-compatible APIs, e.g. Neon AI Gateway.
  OPENAI_BASE_URL: z.url().optional(),
});
