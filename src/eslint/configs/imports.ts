import type { ConfigWithExtends } from "typescript-eslint";

import { pluginAntfu, pluginImport } from "../plugins";

export function imports(
  options: { forbidDefaultExport: boolean } = { forbidDefaultExport: false },
): ConfigWithExtends[] {
  const config = [
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
        "import/no-dynamic-require": "warn",
        "import/no-unresolved": "off",
        "import/consistent-type-specifier-style": "warn",
        "@typescript-eslint/no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "axios",
                message: "Please use fetch instead",
              },
            ],
          },
        ],
      },
    },
  ];

  if (options.forbidDefaultExport) {
    config.push(
      {
        rules: { "import/no-default-export": "error" },
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
          "vitest.config.*",
          "playwright.config.*",
        ],
        rules: {
          "import/no-default-export": "off",
        },
      },
    );
  }

  return config;
}
