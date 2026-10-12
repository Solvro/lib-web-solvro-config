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
        // the current default is stupid IMO
        "unicorn/single-line-block-comment-style": ["error", "single-line"],
        "unicorn/name-replacements": [
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
            ignore: ["e2e"],
          },
        ],
      },
    },
  ];
}
