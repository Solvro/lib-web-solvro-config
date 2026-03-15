import type { KnipConfig } from "knip";

const config = {
  ignore: ["tests/nest-app/**", ".commitlintrc.js"],
  ignoreDependencies: [
    "@commitlint/config-conventional",
    "@vitest/coverage-v8",
  ],
} satisfies KnipConfig;

export default config;
