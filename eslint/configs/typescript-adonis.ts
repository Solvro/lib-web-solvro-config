import type { Linter } from "eslint";
import tseslint from "typescript-eslint";

export function typescriptAdonis(): Linter.Config[] {
  return [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      rules: {
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/no-misused-promises": [
          "error",
          {
            checksVoidReturn: false,
          },
        ],
      },
    },
  ] as Linter.Config[];
}
