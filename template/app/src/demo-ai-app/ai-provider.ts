import OpenAI from "openai";

export type AiProvider = "openai" | "minimax";

type ProviderConfig = {
  baseURL?: string;
  apiKeyEnv: string;
  defaultModel: string;
};

const PROVIDER_CONFIGS: Record<AiProvider, ProviderConfig> = {
  openai: {
    apiKeyEnv: "OPENAI_API_KEY",
    defaultModel: "gpt-4o-mini",
  },
  minimax: {
    baseURL: "https://api.minimax.io/v1",
    apiKeyEnv: "MINIMAX_API_KEY",
    defaultModel: "MiniMax-M2.5",
  },
};

/**
 * Reads the AI_PROVIDER env var and returns the current provider name.
 * Defaults to "openai" if not set.
 */
export function getAiProvider(): AiProvider {
  const raw = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  if (raw !== "openai" && raw !== "minimax") {
    throw new Error(
      `Unsupported AI_PROVIDER "${raw}". Supported values: "openai", "minimax".`,
    );
  }
  return raw;
}

/**
 * Creates an OpenAI-compatible client configured for the selected provider.
 *
 * - **openai** – standard OpenAI SDK usage (no baseURL override).
 * - **minimax** – points the SDK at `https://api.minimax.io/v1`
 *   (MiniMax's OpenAI-compatible endpoint) and reads `MINIMAX_API_KEY`.
 */
export function createAiClient(): OpenAI {
  const provider = getAiProvider();
  const config = PROVIDER_CONFIGS[provider];

  const apiKey = process.env[config.apiKeyEnv];
  if (!apiKey) {
    throw new Error(
      `Missing ${config.apiKeyEnv}. Set it in your .env.server file when using the "${provider}" AI provider.`,
    );
  }

  return new OpenAI({
    apiKey,
    ...(config.baseURL ? { baseURL: config.baseURL } : {}),
  });
}

/**
 * Returns the default chat model for the active provider.
 */
export function getDefaultModel(): string {
  return PROVIDER_CONFIGS[getAiProvider()].defaultModel;
}

/**
 * Ensures the temperature value is within the provider's accepted range.
 *
 * MiniMax requires temperature in the range (0, 1] — a value of exactly 0
 * is rejected. This helper clamps the value when the MiniMax provider is active.
 */
export function clampTemperature(temp: number): number {
  if (getAiProvider() === "minimax") {
    return Math.max(0.01, Math.min(1, temp));
  }
  return temp;
}
