import { wasp } from "wasp/client/vite"
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [wasp(), tailwindcss()],
  server: {
    open: true,
    proxy: {
      // MDK client components fetch /api/mdk relative to the page origin (Vite on :3000).
      // Wasp doesn't auto-proxy this, so we forward it to the Wasp server on :3001.
      "/api/mdk": {
        target: "http://localhost:3001",
      },
    },
  },
});
