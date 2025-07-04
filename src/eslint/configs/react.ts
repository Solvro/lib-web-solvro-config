import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { isPackageExists } from "local-pkg";
import type { ConfigWithExtends } from "typescript-eslint";

const nextJsPackages = ["next"];

export async function react(): Promise<ConfigWithExtends[]> {
  const isUsingNext = nextJsPackages.some((index) => isPackageExists(index));

  const nextjsConfig: ConfigWithExtends[] = [];

  if (isUsingNext) {
    const nextPlugin = await import("@next/eslint-plugin-next").then(
      (d) => d.default,
    );

    nextjsConfig.push(
      {
        name: "solvro/next/setup",
        plugins: {
          "@next/next": nextPlugin,
        },

        rules: nextPlugin.configs.recommended.rules,
      },
      {
        files: [
          "**/app/**/{page,loading,layout,template,error,not-found,unauthorized,forbidden,default,robots,sitemap}.{js,jsx,ts,tsx}",
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
