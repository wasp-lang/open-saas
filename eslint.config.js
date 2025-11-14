import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default tseslint.config(
  // Ignore patterns
  {
    ignores: [
      "**/node_modules/**",
      "**/.wasp/**",
      "**/dist/**",
      "**/build/**",
      "app_diff/**",
      "**/public/**/*.js",
      "**/.astro/**",
    ],
  },

  // Base JavaScript rules for all files
  js.configs.recommended,

  // TypeScript rules for TS/TSX files
  ...tseslint.configs.recommended,

  // React-specific rules
  {
    files: ["**/*.jsx", "**/*.tsx"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Using TypeScript for type checking
      "react/no-unescaped-entities": "off", // Allow apostrophes in JSX
      "react/no-unknown-property": "off", // Allow custom properties (e.g., Alpine.js x-data)
    },
  },

  // CommonJS configuration files (postcss.config.cjs, etc.)
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
  },

  // Custom rules for the entire project
  {
    rules: {
      // Allow unused vars that start with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      // Allow any type when explicitly needed
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow triple slash references (common in Astro)
      "@typescript-eslint/triple-slash-reference": "off",
      // Allow ts-ignore comments (sometimes necessary)
      "@typescript-eslint/ban-ts-comment": "warn",
      // Don't enforce preference for const
      "prefer-const": "warn",
    },
  },
);
