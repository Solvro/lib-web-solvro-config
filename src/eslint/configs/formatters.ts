import type { ConfigWithExtends } from "@eslint/config-helpers";
import prettierConfig from "eslint-config-prettier";

export function formatters(): ConfigWithExtends[] {
  return [
    {
      name: "solvro/prettier",
      rules: {
        ...prettierConfig.rules,
        curly: "error",
      },
    },
  ];
}
