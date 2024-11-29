import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "eslint-config/index.ts",
    "eslint-config/cli.ts",
    "prettier-config/index.ts",
  ],
  shims: true,
});
