import eslintNestJs from "@darraghor/eslint-plugin-nestjs-typed";
import type { ConfigWithExtends } from "typescript-eslint";

import { imports } from "../configs/imports";
import { node } from "../configs/node";
import { typescriptStrict } from "../configs/typescript-strict";
import { unicorn } from "../configs/unicorn";

export const nestjsPreset = (): ConfigWithExtends[] => [
  ...node(),
  ...unicorn(),
  ...typescriptStrict(),
  ...imports({ forbidDefaultExport: true }),
  ...eslintNestJs.configs.flatRecommended,
  {
    rules: {
      "no-implicit-coercion": [
        "error",
        {
          allow: ["+"],
        },
      ],
      "unicorn/prefer-top-level-await": "off",
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
