import { getPackageInfo, isPackageExists } from "local-pkg";

import { GLOB_MARKDOWN, GLOB_SRC, GLOB_TS, GLOB_TSX } from "../globs";
import type {
  OptionsFiles,
  OptionsOverrides,
  OptionsTypeScriptParserOptions,
  OptionsTypeScriptWithTypes,
  TypedFlatConfigItem,
} from "../types";
import { ensurePackages, interopDefault } from "../utils";

// react refresh
const ReactRefreshAllowConstantExportPackages = ["vite"];

const NextJsPackages = ["next"];

export async function react(
  options: OptionsTypeScriptParserOptions &
    OptionsTypeScriptWithTypes &
    OptionsOverrides &
    OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
  const {
    files = [GLOB_SRC],
    filesTypeAware = [GLOB_TS, GLOB_TSX],
    ignoresTypeAware = [`${GLOB_MARKDOWN}/**`],
    overrides = {},
    tsconfigPath,
  } = options;

  await ensurePackages([
    "eslint-plugin-react",
    "eslint-plugin-react-hooks",
    "eslint-plugin-react-refresh",
  ]);

  const isTypeAware = !!tsconfigPath;

  const typeAwareRules: TypedFlatConfigItem["rules"] = {
    "react/jsx-no-leaked-render": "warn",
  };

  const [pluginReact, pluginReactHooks, pluginReactRefresh] = await Promise.all(
    [
      interopDefault(import("eslint-plugin-react")),
      interopDefault(import("eslint-plugin-react-hooks")),
      interopDefault(import("eslint-plugin-react-refresh")),
    ] as const,
  );

  const isAllowConstantExport = ReactRefreshAllowConstantExportPackages.some(
    (i) => isPackageExists(i),
  );
  const isUsingNext = NextJsPackages.some((i) => isPackageExists(i));

  const nextjsConfig = [];

  if (isUsingNext) {
    await ensurePackages(["@next/eslint-plugin-next"]);
    // @ts-expect-error ???
    const nextPlugin = await interopDefault(import("@next/eslint-plugin-next"));

    nextjsConfig.push({
      name: "solvro/next/setup",
      plugins: {
        "@next/next": nextPlugin,
      },
      rules: nextPlugin.configs.recommended.rules,
    });
  }

  return [
    {
      name: "solvro/react/setup",
      plugins: {
        react: pluginReact,
        "react-hooks": pluginReactHooks,
        "react-refresh": pluginReactRefresh,
      },
    },
    ...nextjsConfig,
    {
      files,
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

        // recommended rules react-hooks
        "react-hooks/exhaustive-deps": "warn",
        "react-hooks/rules-of-hooks": "error",
        "react/jsx-no-useless-fragment": "error",
        "react/jsx-no-leaked-render": "warn",

        // react refresh
        "react-refresh/only-export-components": [
          "warn",
          {
            allowConstantExport: isAllowConstantExport,
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

        // overrides
        ...overrides,
      },
    },
    ...(isTypeAware
      ? [
          {
            files: filesTypeAware,
            ignores: ignoresTypeAware,
            name: "antfu/react/type-aware-rules",
            rules: {
              ...typeAwareRules,
            },
          },
        ]
      : []),
  ];
}
