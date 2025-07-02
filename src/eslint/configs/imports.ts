import type { ConfigWithExtends } from "typescript-eslint";

import { pluginAntfu, pluginImport } from "../plugins";

const forbiddenUiLibraries = [
  "@headlessui/react",
  "@mui/material",
  "@chakra-ui/react",
  "@chakra-ui/core",
  "@nextui-org/react",
  "react-bootstrap",
  "antd",
];

export function imports({
  forbidDefaultExport = true,
} = {}): ConfigWithExtends[] {
  const config = [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    pluginImport.flatConfigs.typescript,
    {
      name: "solvro/imports/rules",
      plugins: {
        antfu: pluginAntfu,
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
              ...forbiddenUiLibraries.map((library) => ({
                name: library,
                message: `Please use ui.shadcn.com components instead.`,
              })),
            ],
          },
        ],
      },
    },
  ];

  if (forbidDefaultExport) {
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
