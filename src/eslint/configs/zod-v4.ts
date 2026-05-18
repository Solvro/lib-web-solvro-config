import type { ConfigWithExtends } from "@eslint/config-helpers";

import { pluginZod } from "../plugins";

export function zodV4(): ConfigWithExtends[] {
  return [
    {
      name: "solvro/eslint-zod-v4/rules",
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
        "zod/prefer-string-schema-with-trim": "error",
        "zod/prefer-trim-before-string-length-checks": "error",
        "zod/require-error-message": "error",

        // Zod v4 specific rules
        "zod/no-native-enum": "error",
        "zod/no-number-schema-with-int": "error",
        "zod/no-number-schema-with-finite": "error",
        "zod/no-number-schema-with-safe": "error",
        "zod/no-number-schema-with-step": "error",
        "zod/no-number-schema-with-is-finite": "error",
        "zod/no-number-schema-with-is-int": "error",
        "zod/no-promise-schema": "error",
        "zod/no-schema-with-is-nullable": "error",
        "zod/no-schema-with-is-optional": "error",
        "zod/prefer-loose-object": "error",
        "zod/prefer-meta": "error",
        "zod/prefer-meta-last": "error",
        "zod/prefer-top-level-string-formats": "error",

        // Deprecated rule — off in both v3 and v4
        "zod/no-string-schema-with-uuid": "off",
      },
    },
  ];
}
