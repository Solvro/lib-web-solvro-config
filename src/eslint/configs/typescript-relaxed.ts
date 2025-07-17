import tseslint from "typescript-eslint";
import type { ConfigWithExtends } from "typescript-eslint";

export function typescriptRelaxed(): ConfigWithExtends[] {
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
        "no-useless-constructor": "off",
        "@typescript-eslint/no-useless-constructor": "error",
        "unused-imports/no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            args: "all",
            argsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
          },
        ],
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/no-unnecessary-condition": "warn",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/no-unnecessary-template-expression": "error",
        "@typescript-eslint/strict-boolean-expressions": [
          "error",
          {
            allowNullableObject: false,
          },
        ],
      },
    },
  ];
}
