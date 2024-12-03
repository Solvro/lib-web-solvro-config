import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["eslint-config/index.ts", "prettier-config/index.ts"],
  shims: true,
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  sourcemap: true,
});
