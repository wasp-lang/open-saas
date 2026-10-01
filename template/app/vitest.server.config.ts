import { defineConfig } from "vitest/config";

// `wasp test client` doesn't allow importing `wasp/server`,
// so server tests run with plain Vitest using this config.
export default defineConfig({
  test: {
    include: ["src/**/*.server.test.ts"],
    environment: "node",
  },
});
