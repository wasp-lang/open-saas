import { describe, it, expect, beforeEach, afterEach } from "vitest";

// We test the ai-provider module by importing its functions.
// Because the module reads process.env at call-time (not import-time for
// getAiProvider / getDefaultModel / clampTemperature), we can set env vars
// before each call.

// Dynamic import so we can control env vars before the module is used.
let getAiProvider: typeof import("../ai-provider").getAiProvider;
let getDefaultModel: typeof import("../ai-provider").getDefaultModel;
let clampTemperature: typeof import("../ai-provider").clampTemperature;
let createAiClient: typeof import("../ai-provider").createAiClient;

beforeEach(async () => {
  // Fresh import every test to avoid cached state
  const mod = await import("../ai-provider");
  getAiProvider = mod.getAiProvider;
  getDefaultModel = mod.getDefaultModel;
  clampTemperature = mod.clampTemperature;
  createAiClient = mod.createAiClient;
});

afterEach(() => {
  delete process.env.AI_PROVIDER;
  delete process.env.OPENAI_API_KEY;
  delete process.env.MINIMAX_API_KEY;
});

describe("getAiProvider", () => {
  it("defaults to openai when AI_PROVIDER is not set", () => {
    delete process.env.AI_PROVIDER;
    expect(getAiProvider()).toBe("openai");
  });

  it('returns "openai" when AI_PROVIDER=openai', () => {
    process.env.AI_PROVIDER = "openai";
    expect(getAiProvider()).toBe("openai");
  });

  it('returns "minimax" when AI_PROVIDER=minimax', () => {
    process.env.AI_PROVIDER = "minimax";
    expect(getAiProvider()).toBe("minimax");
  });

  it("is case-insensitive", () => {
    process.env.AI_PROVIDER = "MiniMax";
    expect(getAiProvider()).toBe("minimax");
  });

  it("throws for unsupported provider", () => {
    process.env.AI_PROVIDER = "unsupported";
    expect(() => getAiProvider()).toThrow('Unsupported AI_PROVIDER "unsupported"');
  });
});

describe("getDefaultModel", () => {
  it("returns gpt-4o-mini for openai", () => {
    process.env.AI_PROVIDER = "openai";
    expect(getDefaultModel()).toBe("gpt-4o-mini");
  });

  it("returns MiniMax-M2.5 for minimax", () => {
    process.env.AI_PROVIDER = "minimax";
    expect(getDefaultModel()).toBe("MiniMax-M2.5");
  });
});

describe("clampTemperature", () => {
  it("passes through any value for openai", () => {
    process.env.AI_PROVIDER = "openai";
    expect(clampTemperature(0)).toBe(0);
    expect(clampTemperature(0.5)).toBe(0.5);
    expect(clampTemperature(1)).toBe(1);
    expect(clampTemperature(2)).toBe(2);
  });

  it("clamps 0 to 0.01 for minimax", () => {
    process.env.AI_PROVIDER = "minimax";
    expect(clampTemperature(0)).toBe(0.01);
  });

  it("keeps values in (0, 1] unchanged for minimax", () => {
    process.env.AI_PROVIDER = "minimax";
    expect(clampTemperature(0.5)).toBe(0.5);
    expect(clampTemperature(1)).toBe(1);
  });

  it("clamps values above 1 to 1 for minimax", () => {
    process.env.AI_PROVIDER = "minimax";
    expect(clampTemperature(1.5)).toBe(1);
    expect(clampTemperature(2)).toBe(1);
  });
});

describe("createAiClient", () => {
  it("creates OpenAI client with default config when provider is openai", () => {
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "test-openai-key";
    const client = createAiClient();
    expect(client).toBeDefined();
    expect(client.apiKey).toBe("test-openai-key");
  });

  it("creates OpenAI client with MiniMax baseURL when provider is minimax", () => {
    process.env.AI_PROVIDER = "minimax";
    process.env.MINIMAX_API_KEY = "test-minimax-key";
    const client = createAiClient();
    expect(client).toBeDefined();
    expect(client.apiKey).toBe("test-minimax-key");
    expect(client.baseURL).toBe("https://api.minimax.io/v1");
  });

  it("throws when openai provider is selected but OPENAI_API_KEY is missing", () => {
    process.env.AI_PROVIDER = "openai";
    delete process.env.OPENAI_API_KEY;
    expect(() => createAiClient()).toThrow("Missing OPENAI_API_KEY");
  });

  it("throws when minimax provider is selected but MINIMAX_API_KEY is missing", () => {
    process.env.AI_PROVIDER = "minimax";
    delete process.env.MINIMAX_API_KEY;
    expect(() => createAiClient()).toThrow("Missing MINIMAX_API_KEY");
  });
});
