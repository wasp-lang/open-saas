import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

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
      "react-hooks/exhaustive-deps": "warn", // React hooks dependencies - warning instead of error
      "react-hooks/set-state-in-effect": "warn", // Allow setState in effects (common pattern in this codebase)
      "react/jsx-key": "error", // JSX key prop - keep as error since it's important
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
        process: "readonly",
        console: "readonly",
      },
    },
  },

  // Node.js scripts and MJS files
  {
    files: ["**/*.mjs", "**/scripts/**/*.js"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
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
      // Allow extra non-null assertions - warn instead of error
      "@typescript-eslint/no-extra-non-null-assertion": "warn",
      // Allow unused expressions (common in ternaries)
      "@typescript-eslint/no-unused-expressions": "warn",
      // Case declarations - warn instead of error
      "no-case-declarations": "warn",
      // Sparse arrays - warn instead of error
      "no-sparse-arrays": "warn",
      // Extra boolean cast - warn
      "no-extra-boolean-cast": "warn",
      // Prefer rest params - warn
      "prefer-rest-params": "warn",
    },
  },
);
