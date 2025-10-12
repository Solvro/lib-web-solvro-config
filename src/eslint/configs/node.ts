import type { ConfigWithExtends } from "@eslint/config-helpers";

import { pluginNode } from "../plugins";

export function node(): ConfigWithExtends[] {
  return [
    {
      name: "solvro/node/rules",
      plugins: {
        node: pluginNode,
      },
      rules: {
        "node/handle-callback-err": ["error", "^(err|error)$"],
        "node/no-deprecated-api": "error",
        "node/no-exports-assign": "error",
        "node/no-new-require": "error",
        "node/no-path-concat": "error",
        "node/prefer-global/buffer": ["error"],
        "node/prefer-global/process": ["error"],
        "node/process-exit-as-throw": "error",
      },
    },
  ];
}
