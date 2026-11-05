import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests run outside a Wasp build, where the generated `wasp/*` modules
// do not exist yet. Tests mock them with `vi.mock`; these aliases only give
// the imports something to resolve to.
const stub = (name: string) =>
  fileURLToPath(new URL(`./test/stubs/${name}.ts`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^wasp\/server$/, replacement: stub("wasp-server") },
      { find: /^wasp\/server\/email$/, replacement: stub("wasp-server-email") },
    ],
  },
});
