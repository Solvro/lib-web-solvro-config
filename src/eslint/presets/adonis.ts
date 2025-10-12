import type { ConfigWithExtends } from "@eslint/config-helpers";

import { configApp } from "@adonisjs/eslint-config";

import { imports } from "../configs/imports";
import { node } from "../configs/node";

export const adonisPreset = (): ConfigWithExtends[] => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const builtinAdonisConfig: ConfigWithExtends[] = configApp();

  return [
    ...builtinAdonisConfig,
    ...node(),
    ...imports(),
    {
      rules: {
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: ["enum", "enumMember", "class", "interface", "typeLike"],
            format: ["PascalCase"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
          },
          {
            selector: [
              "classProperty",
              "classMethod",
              "method",
              "variableLike",
            ],
            format: ["camelCase"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
          },
          {
            selector: "variable",
            format: ["camelCase", "UPPER_CASE", "PascalCase"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
          },
        ],
      },
    },
  ];
};
