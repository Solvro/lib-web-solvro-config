import type { ConfigWithExtends } from "@eslint/config-helpers";

import { pluginUnicorn } from "../plugins";

export function unicorn(): ConfigWithExtends[] {
  return [
    {
      name: "solvro/unicorn/rules",
      plugins: {
        unicorn: pluginUnicorn,
      },
      rules: {
        ...pluginUnicorn.configs.recommended.rules,
        "unicorn/no-array-reduce": "off",
        "unicorn/no-null": "off",
        "unicorn/no-useless-switch-case": "off",
        "unicorn/prefer-global-this": "off",
        "unicorn/prevent-abbreviations": [
          "error",
          {
            replacements: {
              env: false,
              envs: false,
              props: false,
              prop: false,
              ref: false,
              utils: false,
            },
            allowList: {
              e2e: true,
            },
            ignore: [String.raw`e2e`],
          },
        ],
      },
    },
  ];
}
