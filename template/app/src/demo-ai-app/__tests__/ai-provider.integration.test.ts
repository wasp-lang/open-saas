/**
 * Integration tests for the MiniMax AI provider.
 *
 * These tests call the real MiniMax API and require a valid MINIMAX_API_KEY
 * environment variable.  Run them with:
 *
 *   MINIMAX_API_KEY=sk-... npx vitest run --reporter=verbose ai-provider.integration
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import OpenAI from "openai";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

describe.skipIf(!MINIMAX_API_KEY)(
  "MiniMax integration (requires MINIMAX_API_KEY)",
  () => {
    let client: OpenAI;
    const savedEnv: Record<string, string | undefined> = {};

    beforeAll(() => {
      savedEnv.AI_PROVIDER = process.env.AI_PROVIDER;
      savedEnv.MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

      client = new OpenAI({
        apiKey: MINIMAX_API_KEY!,
        baseURL: "https://api.minimax.io/v1",
      });
    });

    afterAll(() => {
      Object.entries(savedEnv).forEach(([k, v]) => {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      });
    });

    it("completes a simple chat request with MiniMax-M2.5", async () => {
      const completion = await client.chat.completions.create({
        model: "MiniMax-M2.5",
        messages: [{ role: "user", content: "Reply with exactly: hello" }],
        temperature: 1,
        max_tokens: 32,
      });

      expect(completion.choices).toBeDefined();
      expect(completion.choices.length).toBeGreaterThan(0);

      const text = completion.choices[0].message.content ?? "";
      expect(text.toLowerCase()).toContain("hello");
    }, 30_000);

    it("supports function/tool calling with MiniMax-M2.5", async () => {
      const completion = await client.chat.completions.create({
        model: "MiniMax-M2.5",
        messages: [
          {
            role: "user",
            content: "What is the weather in San Francisco?",
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "get_weather",
              description: "Get the weather for a location",
              parameters: {
                type: "object",
                properties: {
                  location: { type: "string", description: "City name" },
                },
                required: ["location"],
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "get_weather" },
        },
        temperature: 1,
        max_tokens: 128,
      });

      expect(completion.choices).toBeDefined();
      expect(completion.choices.length).toBeGreaterThan(0);

      const toolCalls = completion.choices[0].message.tool_calls;
      expect(toolCalls).toBeDefined();
      expect(toolCalls!.length).toBeGreaterThan(0);
      expect(toolCalls![0].function.name).toBe("get_weather");

      const args = JSON.parse(toolCalls![0].function.arguments);
      expect(args.location).toBeDefined();
    }, 30_000);

    it("completes a request with MiniMax-M2.5-highspeed", async () => {
      const completion = await client.chat.completions.create({
        model: "MiniMax-M2.5-highspeed",
        messages: [{ role: "user", content: "Reply with exactly: ok" }],
        temperature: 1,
        max_tokens: 16,
      });

      expect(completion.choices).toBeDefined();
      expect(completion.choices.length).toBeGreaterThan(0);

      const text = completion.choices[0].message.content ?? "";
      expect(text.toLowerCase()).toContain("ok");
    }, 30_000);
  },
);
