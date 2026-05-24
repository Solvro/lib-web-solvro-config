import type { KnipConfig } from "knip";

const config = {
  ignore: ["tests/nest-app/**", ".commitlintrc.js"],
  ignoreDependencies: [
    "@commitlint/config-conventional",
    // this is actually used in src/eslint/stub.d.ts - possible bug in knip?
    "@typescript-eslint/utils",
    // this is actually used in .github/workflows/preview.yml - maybe knip doesn't see `npm exec` as usage?
    "pkg-pr-new",
  ],
} satisfies KnipConfig;

export default config;
