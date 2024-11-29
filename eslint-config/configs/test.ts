import { GLOB_TESTS } from "../globs";
import type {
  OptionsFiles,
  OptionsIsInEditor,
  OptionsOverrides,
  TypedFlatConfigItem,
} from "../types";
import { interopDefault } from "../utils";

// Hold the reference so we don't redeclare the plugin on each call
let _pluginTest: any;

export async function test(
  options: OptionsFiles & OptionsIsInEditor & OptionsOverrides = {},
): Promise<TypedFlatConfigItem[]> {
  const { files = GLOB_TESTS, isInEditor = false, overrides = {} } = options;

  const [pluginVitest, pluginNoOnlyTests] = await Promise.all([
    interopDefault(import("@vitest/eslint-plugin")),
    // @ts-expect-error missing types
    interopDefault(import("eslint-plugin-no-only-tests")),
  ] as const);

  _pluginTest = _pluginTest || {
    ...pluginVitest,
    rules: {
      ...pluginVitest.rules,
      // extend `test/no-only-tests` rule
      ...pluginNoOnlyTests.rules,
    },
  };

  return [
    {
      name: "solvro/test/setup",
      plugins: {
        "no-only-tests": _pluginTest,
      },
    },
    {
      files,
      name: "solvro/test/rules",
      rules: {
        "no-only-tests/consistent-test-it": [
          "error",
          { fn: "it", withinDescribe: "it" },
        ],
        "no-only-tests/no-identical-title": "error",
        "no-only-tests/no-import-node-test": "error",
        "no-only-tests/no-only-tests": isInEditor ? "off" : "error",

        "no-only-tests/prefer-hooks-in-order": "error",
        "no-only-tests/prefer-lowercase-title": "error",

        // Disables
        ...{
          "antfu/no-top-level-await": "off",
          "no-unused-expressions": "off",
          "node/prefer-global/process": "off",
          "@typescript-eslint/explicit-function-return-type": "off",
        },

        ...overrides,
      },
    },
  ];
}
