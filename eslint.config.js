// eslint-disable-next-line antfu/no-import-dist
import { solvro } from "./dist/eslint/index.js";

export default solvro(
  {
    rules: {
      "unicorn/no-process-exit": "off",
    },
  },
  {
    // `no-unnecessary-type-assertion` crashes the TypeScript checker with
    // infinite recursion when instantiating execa's recursive types here,
    // and the module-level cache in this file is intentional.
    files: ["src/utils/$$.ts"],
    rules: {
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "unicorn/no-top-level-assignment-in-function": "off",
    },
  },
  {
    ignores: ["tests/**"],
  },
);
