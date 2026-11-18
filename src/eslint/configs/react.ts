import type { ConfigWithExtends, Plugin } from "@eslint/config-helpers";
import { getPackageInfoSync, isPackageListedSync } from "local-pkg";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  pluginNelsonLai,
  pluginQuery,
  pluginReact,
  pluginReactEffects,
  pluginReactHooks,
  pluginReactRefresh,
} from "../plugins";

const nextJsPackages = ["next"];
const vitePackages = ["vite"];
const reactCompilerPackages = [
  "babel-plugin-react-compiler",
  "react-compiler-runtime",
];

/**
eslint-plugin-react's own version detection uses `context.getFilename()`,
which was removed in ESLint 10, so we resolve the React version ourselves.
*/
function detectReactVersion(): string {
  const reactPackage = getPackageInfoSync("react");
  return reactPackage?.version ?? "19.0.0";
}

// shortcut: regex on next.config text instead of evaluating it, upgrade if false positives show up
export function hasNextReactCompiler(cwd = process.cwd()): boolean {
  return ["js", "mjs", "cjs", "ts", "mts"].some((extension) => {
    const file = path.join(cwd, `next.config.${extension}`);
    return (
      existsSync(file) &&
      /^[^/\n]*\breactCompiler\s*:\s*(true|\{)/m.test(
        readFileSync(file, "utf8"),
      )
    );
  });
}

export async function react(): Promise<ConfigWithExtends[]> {
  const isUsingNext = nextJsPackages.some((index) =>
    isPackageListedSync(index),
  );
  const isUsingVite = vitePackages.some((index) => isPackageListedSync(index));

  const nextjsConfig: ConfigWithExtends[] = [];

  if (isUsingNext) {
    const nextPluginModule = await import("@next/eslint-plugin-next");
    const nextPlugin = nextPluginModule.default;

    nextjsConfig.push(
      {
        name: "solvro/next/setup",
        plugins: {
          // @ts-expect-error ???
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
          "import-x/no-default-export": "off",
        },
      },
    );
  }

  const isUsingReactCompiler =
    reactCompilerPackages.some((index) => isPackageListedSync(index)) ||
    hasNextReactCompiler();

  const viteConfig: ConfigWithExtends[] = [];

  if (isUsingVite) {
    viteConfig.push(pluginReactRefresh.configs.vite);
  }

  return [
    {
      name: "solvro/react/setup",
      plugins: {
        react: pluginReact,
        "react-hooks": pluginReactHooks,
        "@nelsonlaidev": pluginNelsonLai as unknown as Plugin,
      },
    },
    ...nextjsConfig,
    ...viteConfig,
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
          version: detectReactVersion(),
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
        // https://github.com/nelsonlaidev/config/tree/main/packages/eslint-plugin
        "@nelsonlaidev/lucide-icon-suffix": "error",
        "@nelsonlaidev/shadcn-cn-wrap-variants": "error",
        "@nelsonlaidev/shadcn-cva-variants-suffix": "error",
        "@nelsonlaidev/shadcn-prefer-spinner": "error",
      },
    },
    // compiler-powered rules (purity, refs, immutability, ...) only make sense with React Compiler
    ...(isUsingReactCompiler
      ? [
          {
            name: "solvro/react/compiler",
            files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
            rules: (
              pluginReactHooks.configs as unknown as {
                flat: { recommended: ConfigWithExtends };
              }
            ).flat.recommended.rules,
          } satisfies ConfigWithExtends,
        ]
      : []),
    ...pluginQuery.configs["flat/recommended"],
    pluginReactEffects.configs.recommended,
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
