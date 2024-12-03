import type { Linter } from "eslint";

import { pluginAntfu, pluginImport } from "../plugins";

export function imports(): Linter.Config[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    pluginImport.flatConfigs.typescript,
    {
      name: "solvro/imports/rules",
      plugins: {
        antfu: pluginAntfu,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        import: pluginImport,
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      rules: {
        "antfu/import-dedupe": "error",
        "antfu/no-import-dist": "error",
        "antfu/no-import-node-modules-by-path": "error",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...pluginImport.flatConfigs.recommended.rules,
        "import/no-default-export": "error",
        "import/no-dynamic-require": "warn",
        "import/no-unresolved": "off",
        "import/consistent-type-specifier-style": "warn",
      },
    },
    {
      files: [
        "tsup.config.*",
        "eslint.config.*",
        ".commitlintrc.*",
        "knip.*",
        "next.config.*",
        "commitlint.config.*",
        ".releaserc.*",
      ],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ];
}
