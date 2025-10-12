import type { KnipConfig } from "knip";

const config = {
  ignore: ["tests/nest-app/**", ".commitlintrc.js"],
  ignoreDependencies: [
    "prettier-plugin-packagejson",
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports",
    "@commitlint/config-conventional",
    "@vitest/coverage-v8",
  ],
} satisfies KnipConfig;

export default config;
