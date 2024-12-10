import prettierConfig from "eslint-config-prettier";
import type { ConfigWithExtends } from "typescript-eslint";

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
