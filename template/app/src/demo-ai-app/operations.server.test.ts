import { describe, expect, it, vi } from "vitest";
import { generateGptResponse } from "./operations";

const createChatCompletion = vi.hoisted(() => vi.fn());

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: createChatCompletion } };
  },
}));

vi.mock("wasp/server", () => ({
  env: { OPENAI_API_KEY: "test-key" },
  HttpError: class extends Error {
    constructor(
      public statusCode: number,
      message?: string,
    ) {
      super(message);
    }
  },
}));

type GenerateGptResponseContext = Parameters<typeof generateGptResponse>[1];

describe("generateGptResponse", () => {
  it("rejects a user without credits before calling OpenAI", async () => {
    const context = {
      user: { id: "user-id", credits: 0, subscriptionStatus: null },
      entities: {
        User: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          update: vi.fn(),
        },
        Task: { findMany: vi.fn().mockResolvedValue([]) },
        GptResponse: { create: vi.fn() },
      },
    } as unknown as GenerateGptResponseContext;

    await expect(generateGptResponse({ hours: 8 }, context)).rejects.toEqual(
      expect.objectContaining({ statusCode: 402 }),
    );
    expect(createChatCompletion).not.toHaveBeenCalled();
  });
});
