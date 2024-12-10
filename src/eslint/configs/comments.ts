import type { ConfigWithExtends } from "typescript-eslint";

import { pluginComments } from "../plugins";

export function comments(): ConfigWithExtends[] {
  return [
    {
      name: "solvro/eslint-comments/rules",
      plugins: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        "eslint-comments": pluginComments,
      },
      rules: {
        "eslint-comments/no-aggregating-enable": "error",
        "eslint-comments/no-duplicate-disable": "error",
        "eslint-comments/no-unlimited-disable": "error",
        "eslint-comments/no-unused-enable": "error",
      },
    },
  ];
}
