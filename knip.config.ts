import type { KnipConfig } from "knip";

const config = {
  ignore: ["tests/nest-app/**", ".commitlintrc.js"],
  ignoreDependencies: [
    "@commitlint/config-conventional",
    "@vitest/coverage-v8",
    // this is actually used in src/eslint/stub.d.ts - possible bug in knip?
    "@typescript-eslint/utils",
  ],
} satisfies KnipConfig;

export default config;
