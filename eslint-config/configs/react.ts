// @ts-expect-error ???
import nextPlugin from "@next/eslint-plugin-next";
import type { Linter } from "eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import { isPackageExists } from "local-pkg";

const NextJsPackages = ["next"];

export function react(): Linter.Config[] {
  const isUsingNext = NextJsPackages.some((index) => isPackageExists(index));

  const nextjsConfig = [];

  if (isUsingNext) {
    nextjsConfig.push({
      name: "solvro/next/setup",
      plugins: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        "@next/next": nextPlugin,
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      rules: nextPlugin.configs.recommended.rules,
    });
  }

  return [
    {
      name: "solvro/react/setup",
      plugins: {
        // @ts-expect-error ???
        react: pluginReact,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        "react-hooks": pluginReactHooks,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        "react-refresh": pluginReactRefresh,
      },
    },
    ...nextjsConfig,
    {
      files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
        sourceType: "module",
      },
      settings: {
        react: {
          version: "detect",
        },
      },
      name: "solvro/react/rules",
      rules: {
        ...pluginReact.configs.flat?.recommended.rules,
        ...pluginReact.configs.flat?.["jsx-runtime"].rules,
        "react/jsx-no-leaked-render": "warn",
        // recommended rules react-hooks
        "react-hooks/exhaustive-deps": "warn",
        "react-hooks/rules-of-hooks": "error",
        "react/jsx-no-useless-fragment": "error",

        // react refresh
        "react-refresh/only-export-components": [
          "warn",
          {
            allowConstantExport: false,
            allowExportNames: [
              ...(isUsingNext
                ? [
                    "dynamic",
                    "dynamicParams",
                    "revalidate",
                    "fetchCache",
                    "runtime",
                    "preferredRegion",
                    "maxDuration",
                    "config",
                    "generateStaticParams",
                    "metadata",
                    "generateMetadata",
                    "viewport",
                    "generateViewport",
                  ]
                : []),
            ],
          },
        ],
      },
    },
  ];
}
