import * as z from "zod";

export const demoAiAppEnvSchema = z.object({
  // Set AI_PROVIDER to "openai" (default) or "minimax" to switch the LLM backend.
  AI_PROVIDER: z.enum(["openai", "minimax"]).optional(),
  // Required when AI_PROVIDER is "openai" (default).
  OPENAI_API_KEY: z.string().optional(),
  // Required when AI_PROVIDER is "minimax".
  // Get your key at https://platform.minimax.io
  MINIMAX_API_KEY: z.string().optional(),
});
