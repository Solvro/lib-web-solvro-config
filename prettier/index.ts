import type { Options } from "prettier";

/**
 * Some of Prettier's defaults can be overridden by an EditorConfig file. We
 * define those here to ensure that doesn't happen.
 *
 * See: https://github.com/prettier/prettier/blob/main/docs/configuration.md#editorconfig
 */
const overridableDefaults = {
  arrowParens: "always",
  endOfLine: "lf",
  printWidth: 80,
  quoteProps: "as-needed",
  semi: true,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,
} as const;

// eslint-disable-next-line import/no-default-export
export default {
  ...overridableDefaults,
  importOrder: ["^@assets/(.*)$", "<THIRD_PARTY_MODULES>", "^@/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["typescript", "decorators-legacy"],
  plugins: [
    "prettier-plugin-packagejson",
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  singleQuote: false,
} satisfies Options;
