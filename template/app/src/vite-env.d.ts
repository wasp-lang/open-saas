/// <reference types="vite/client" />

// These add some tweaks to the types of common JavaScript built-in objects and
// DOM APIs to make their usage more ergonomic and type-safe.
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";

// This is needed to properly support Vitest testing with jest-dom matchers.
// Types for jest-dom are not recognized automatically and Typescript complains
// about missing types e.g. when using `toBeInTheDocument` and other matchers.
// Reference: https://github.com/testing-library/jest-dom/issues/546#issuecomment-1889884843
import "@testing-library/jest-dom";
