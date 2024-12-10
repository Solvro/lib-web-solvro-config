import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/eslint/index.ts"],
    shims: true,
    clean: true,
    dts: true,
    format: ["cjs", "esm"],
    sourcemap: true,
    outDir: "dist/eslint",
  },
  {
    entry: ["src/prettier/index.ts"],
    clean: true,
    format: "esm",
    dts: false,
    outDir: "dist/prettier",
  },
]);
