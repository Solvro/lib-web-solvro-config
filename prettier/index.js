/**
 * Some of Prettier's defaults can be overridden by an EditorConfig file. We
 * define those here to ensure that doesn't happen.
 *
 * See: https://github.com/prettier/prettier/blob/main/docs/configuration.md#editorconfig
 */
const overridableDefaults = {
  endOfLine: "lf",
  tabWidth: 2,
  printWidth: 80,
  useTabs: false,
  arrowParens: "always",
  trailingComma: "all",
  semi: true,
  quoteProps: "as-needed",
};

module.exports = {
  ...overridableDefaults,
  singleQuote: false,
  plugins: [
    "prettier-plugin-packagejson",
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrder: ["^@assets/(.*)$", "<THIRD_PARTY_MODULES>", "^@/(.*)$", "^[./]"],
};
