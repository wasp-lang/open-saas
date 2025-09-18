import starlightPlugin from "@astrojs/starlight-tailwind";
import colors from "tailwindcss/colors";

const yellow = colors.yellow
const gray = colors.gray

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        accent: yellow, gray
      },
    },
  },
  plugins: [starlightPlugin()],
};
