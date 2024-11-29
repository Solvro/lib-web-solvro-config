import { pluginAntfu, pluginImport } from "../plugins";
import type { TypedFlatConfigItem } from "../types";

export async function imports(): Promise<TypedFlatConfigItem[]> {
  return [
    {
      name: "solvro/imports/rules",
      plugins: {
        antfu: pluginAntfu,
        import: pluginImport,
      },
      rules: {
        "antfu/import-dedupe": "error",
        "antfu/no-import-dist": "error",
        "antfu/no-import-node-modules-by-path": "error",

        "import/first": "error",
        "import/no-duplicates": "error",
        "import/no-mutable-exports": "error",
        "import/no-named-default": "error",
        "import/no-self-import": "error",
        "import/no-webpack-loader-syntax": "error",
      },
    },
  ];
}
