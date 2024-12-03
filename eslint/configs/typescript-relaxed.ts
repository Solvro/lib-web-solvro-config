import type { Linter } from "eslint";
import tseslint from "typescript-eslint";

export function typescriptRelaxed(): Linter.Config[] {
  return [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      name: "solvro/typescript-relaxed/rules",
      rules: {
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/no-misused-promises": [
          "error",
          {
            checksVoidReturn: false,
          },
        ],
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/no-unnecessary-condition": "warn",
      },
    },
  ] as Linter.Config[];
}
