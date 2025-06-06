import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { isPackageExists } from "local-pkg";
import type { ConfigWithExtends } from "typescript-eslint";

const nextJsPackages = ["next"];

const forbiddenLibraries = [
  "@headlessui/react",
  "@mui/material",
  "@chakra-ui/react",
  "@chakra-ui/core",
  "@nextui-org/react",
  "react-bootstrap",
  "antd",
];

export async function react(): Promise<ConfigWithExtends[]> {
  const isUsingNext = nextJsPackages.some((index) => isPackageExists(index));

  const nextjsConfig: ConfigWithExtends[] = [];

  if (isUsingNext) {
    // @ts-expect-error ???
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const nextPlugin = await import("@next/eslint-plugin-next").then(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (d) => d.default,
    );

    nextjsConfig.push(
      {
        name: "solvro/next/setup",
        plugins: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          "@next/next": nextPlugin,
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        rules: nextPlugin.configs.recommended.rules,
      },
      {
        files: [
          "**/app/**/{page,loading,layout,template,error,not-found,unauthorized,forbidden,default}.{js,jsx,ts,tsx}",
          "**/pages/**/*.{js,jsx,ts,tsx}",
        ],
        name: "solvro/next/pages",
        rules: {
          "import/no-default-export": "off",
        },
      },
    );
  }

  return [
    {
      name: "solvro/react/setup",
      plugins: {
        react: pluginReact,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        "react-hooks": pluginReactHooks,
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
        ...pluginReact.configs.flat.recommended.rules,
        ...pluginReact.configs.flat["jsx-runtime"].rules,
        "react/no-danger": "warn",
        "react/jsx-no-leaked-render": "warn",
        // recommended rules react-hooks
        "react-hooks/exhaustive-deps": "warn",
        "react-hooks/rules-of-hooks": "error",
        "react/jsx-no-useless-fragment": "error",
        "react/function-component-definition": [
          "error",
          {
            unnamedComponents: "arrow-function",
            namedComponents: "function-declaration",
          },
        ],
        "react/hook-use-state": [
          "error",
          {
            allowDestructuredState: true,
          },
        ],
        "react/no-array-index-key": "warn",
        "@typescript-eslint/no-restricted-imports": [
          "error",
          {
            paths: forbiddenLibraries.map((library) => ({
              name: library,
              message: `Please use ui.shadcn.com components instead.`,
            })),
          },
        ],
      },
    },
    ...pluginQuery.configs["flat/recommended"],
    {
      name: "solvro/react/disables",
      files: ["**/components/ui/*.{jsx,tsx}"],
      rules: {
        "react/prop-types": "off",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "unicorn/no-document-cookie": "off",
        "@typescript-eslint/no-redeclare": "off",
        "@typescript-eslint/no-deprecated": "off",
      },
    },
  ];
}
