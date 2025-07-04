// eslint-disable-next-line antfu/no-import-dist
import { solvro } from "./dist/eslint/index.js";

export default solvro(
  {
    rules: {
      "unicorn/no-process-exit": "off",
    },
  },
  {
    ignores: ["tests/**"],
  },
);
