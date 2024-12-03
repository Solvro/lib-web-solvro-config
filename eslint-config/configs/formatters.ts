import type { Linter } from "eslint";
import prettierConfig from "eslint-config-prettier";

export function formatters(): Linter.Config[] {
  return [
    {
      name: "solvro/prettier",
      ...prettierConfig,
    },
  ];
}
