import type { Linter } from "eslint";

import { pluginAntfu, pluginImport } from "../plugins";

export function imports(): Linter.Config[] {
  return [
    {
      name: "solvro/imports/rules",
      plugins: {
        antfu: pluginAntfu,
        // @ts-expect-error ???
        "import-x": pluginImport,
      },
      rules: {
        "antfu/import-dedupe": "error",
        "antfu/no-import-dist": "error",
        "antfu/no-import-node-modules-by-path": "error",

        "import-x/first": "error",
        "import-x/no-duplicates": "error",
        "import-x/no-mutable-exports": "error",
        "import-x/no-named-default": "error",
        "import-x/no-self-import": "error",
        "import-x/no-webpack-loader-syntax": "error",
      },
    },
  ];
}
