import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { wasp } from "wasp/client/vite";

export default defineConfig({
  plugins: [wasp(), tailwindcss()],
  server: {
    open: true,
  },
  test: {
    // Server tests run separately, see `vitest.server.config.ts`.
    exclude: ["src/**/*.server.test.ts"],
  },
});
