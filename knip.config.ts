import type { KnipConfig } from "knip";

const config = {
  ignore: [],
  ignoreDependencies: [
    "prettier-plugin-packagejson",
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports",
  ],
} satisfies KnipConfig;

export default config;
