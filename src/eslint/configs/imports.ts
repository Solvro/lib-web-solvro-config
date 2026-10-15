import type { ConfigWithExtends } from "@eslint/config-helpers";
import { createRequire } from "node:module";

import { pluginAntfu, pluginImport } from "../plugins";

/**
Resolved to an absolute path so that the resolver is found even when this
package is installed as a dependency and the resolver is not hoisted to the
consumer's root `node_modules`.
*/
const typescriptResolver = createRequire(import.meta.url).resolve(
  "eslint-import-resolver-typescript",
);

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
  const config: ConfigWithExtends[] = [
    {
      name: "solvro/imports/setup",
      plugins: {
        "import-x": pluginImport,
      },
      settings: {
        "import-x/extensions": [
          ".js",
          ".jsx",
          ".mjs",
          ".cjs",
          ".ts",
          ".tsx",
          ".mts",
          ".cts",
        ],
        "import-x/external-module-folders": [
          "node_modules",
          "node_modules/@types",
        ],
        "import-x/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx", ".mts", ".cts"],
        },
        "import-x/resolver": {
          [typescriptResolver]: { alwaysTryTypes: true },
        },
      },
    },
    {
      name: "solvro/imports/rules",
      plugins: {
        antfu: pluginAntfu,
      },

      rules: {
        "antfu/import-dedupe": "error",
        "antfu/no-import-dist": "error",
        "antfu/no-import-node-modules-by-path": "error",

        ...(pluginImport.flatConfigs.recommended
          .rules as ConfigWithExtends["rules"]),
        // TypeScript already validates named exports at compile time
        "import-x/named": "off",
        "import-x/no-dynamic-require": "warn",
        "import-x/no-unresolved": "off",
        "import-x/consistent-type-specifier-style": "warn",
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
        rules: { "import-x/no-default-export": "error" },
      },
      {
        files: [
          "tsup.config.*",
          "eslint.config.*",
          ".commitlintrc.*",
          "knip.*",
          "next.config.*",
          "commitlint.config.*",
          "vite.config.*",
          ".releaserc.*",
          "release.config.*",
          "vitest.config.*",
          "postcss.config.*",
          "playwright.config.*",
        ],
        rules: {
          "import-x/no-default-export": "off",
        },
      },
    );
  }

  return config;
}
