import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["eslint/index.ts"],
    shims: true,
    clean: true,
    dts: true,
    format: ["cjs", "esm"],
    sourcemap: true,
    outDir: "dist/eslint",
  },
  {
    entry: ["prettier/index.ts"],
    clean: true,
    format: "esm",
    dts: false,
    outDir: "dist/prettier",
  },
]);
