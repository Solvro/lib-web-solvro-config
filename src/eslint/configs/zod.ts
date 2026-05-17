import type { ConfigWithExtends } from "@eslint/config-helpers";

import { pluginZod } from "../plugins";

export function zod(): ConfigWithExtends[] {
  return [
    {
      name: "solvro/eslint-zod/rules",
      plugins: {
        zod: pluginZod,
      },
      rules: {
        "zod/consistent-import": ["error", { syntax: "namespace" }],
      },
    },
  ];
}
