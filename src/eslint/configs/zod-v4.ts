import type { ConfigWithExtends } from "@eslint/config-helpers";

import { pluginZod } from "../plugins";
import { zodV3 } from "./zod-v3";

export function zodV4(): ConfigWithExtends[] {
  return [
    {
      name: "solvro/eslint-zod-v4/rules",
      plugins: {
        zod: pluginZod,
      },

      rules: {
        ...zodV3()[0].rules,

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
        "zod/require-error-message": "error",

        // Deprecated rule — off in both v3 and v4
        "zod/no-string-schema-with-uuid": "off",
      },
    },
  ];
}
