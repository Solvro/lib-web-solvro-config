import eslintNestJs from "@darraghor/eslint-plugin-nestjs-typed";
import type { ConfigWithExtends } from "@eslint/config-helpers";
import { isPackageListed } from "local-pkg";

import { imports } from "../configs/imports";
import { node } from "../configs/node";
import { typescriptStrict } from "../configs/typescript-strict";
import { unicorn } from "../configs/unicorn";

export const nestjsPreset = async (): Promise<ConfigWithExtends[]> => {
  const hasSwagger = await isPackageListed("@nestjs/swagger");

  const nestjsConfig: ConfigWithExtends[] = hasSwagger
    ? ([
        ...(eslintNestJs.configs.flatRecommended as ConfigWithExtends[]),
        {
          rules: {
            "@darraghor/nestjs-typed/api-property-matches-property-optionality":
              "warn",
            "@darraghor/nestjs-typed/controllers-should-supply-api-tags":
              "warn",
            "@darraghor/nestjs-typed/api-method-should-specify-api-response":
              "warn",
            "@darraghor/nestjs-typed/api-method-should-specify-api-operation":
              "warn",
            "@darraghor/nestjs-typed/api-enum-property-best-practices": "warn",
            "@darraghor/nestjs-typed/api-property-returning-array-should-set-array":
              "warn",
          },
        },
      ] satisfies ConfigWithExtends[])
    : (eslintNestJs.configs.flatNoSwagger as ConfigWithExtends[]);

  return [
    ...node(),
    ...unicorn(),
    ...typescriptStrict(),
    ...imports({ forbidDefaultExport: true }),
    ...nestjsConfig,
    {
      rules: {
        "no-implicit-coercion": [
          "error",
          {
            allow: ["+"],
          },
        ],
        "unicorn/prefer-top-level-await": "off",
        // flaky as hell
        "@darraghor/nestjs-typed/injectable-should-be-provided": "off",
      },
    },
    {
      rules: {
        "@typescript-eslint/no-extraneous-class": [
          "error",
          {
            allowEmpty: true,
          },
        ],
      },
      files: ["**/*.module.ts"],
    },
    {
      rules: {
        "@typescript-eslint/no-floating-promises": "off",
      },
      files: ["./src/main.ts"],
    },
  ];
};
