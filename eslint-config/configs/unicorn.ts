import type { Linter } from "eslint";

import { pluginUnicorn } from "../plugins";

export function unicorn(): Linter.Config[] {
  return [
    {
      name: "solvro/unicorn/rules",
      plugins: {
        unicorn: pluginUnicorn,
      },
      rules: {
        ...pluginUnicorn.configs["flat/recommended"].rules,
        "unicorn/no-array-reduce": "off",
        "unicorn/no-null": "off",
      },
    },
  ];
}
