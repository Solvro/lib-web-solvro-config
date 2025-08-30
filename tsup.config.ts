import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: [
      "src/eslint/index.ts",
      "src/prettier/index.ts",
      "src/cli/index.ts",
      "src/commitlint/index.ts",
    ],
    clean: true,
    dts: true,
    shims: true,
    format: ["esm", "cjs"],
    sourcemap: true,
    outDir: "dist",
  },
]);
