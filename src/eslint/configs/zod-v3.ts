import type { ConfigWithExtends } from "@eslint/config-helpers";

import { pluginZod } from "../plugins";

export function zodV3(): ConfigWithExtends[] {
  return [
    {
      name: "solvro/eslint-zod-v3/rules",
      plugins: {
        zod: pluginZod,
      },
      rules: {
        // Style & consistency
        "zod/array-style": ["error", { style: "function" }],
        "zod/consistent-import": ["error", { syntax: "namespace" }],
        "zod/consistent-schema-var-name": ["error", { after: "Schema" }],
        "zod/consistent-schema-output-type-style": [
          "error",
          { style: "infer" },
        ],

        // Disallow unsafe patterns
        "zod/no-any-schema": "error",
        "zod/no-empty-custom-schema": "error",
        "zod/no-optional-and-default-together": "error",
        "zod/no-throw-in-refine": "error",
        "zod/no-transform-in-record-key": "error",

        // Preferred patterns
        "zod/prefer-enum-over-literal-union": "error",
        "zod/prefer-strict-object": "error",
        "zod/prefer-string-schema-with-trim": "warn",
        "zod/prefer-trim-before-string-length-checks": "error",

        // Rules below are Zod v4 specific — disabled for v3 projects
        "zod/no-native-enum": "off",
        "zod/no-number-schema-with-int": "off",
        "zod/no-number-schema-with-finite": "off",
        "zod/no-number-schema-with-safe": "off",
        "zod/no-number-schema-with-step": "off",
        "zod/no-number-schema-with-is-finite": "off",
        "zod/no-number-schema-with-is-int": "off",
        "zod/no-promise-schema": "off",
        "zod/no-schema-with-is-nullable": "off",
        "zod/no-schema-with-is-optional": "off",
        "zod/no-string-schema-with-uuid": "off",
        "zod/prefer-loose-object": "off",
        "zod/prefer-meta": "off",
        "zod/prefer-meta-last": "off",
        "zod/prefer-top-level-string-formats": "off",
        "zod/require-error-message": "off",
      },
    },
  ];
}
