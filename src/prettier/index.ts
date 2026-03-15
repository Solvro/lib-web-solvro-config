import { createRequire } from "node:module";
import type { Options } from "prettier";

// needed for plugin resolution in non-flat dependency layouts (e.g. pnpm)
const require = createRequire(import.meta.url);

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
  importOrder: [
    "^@assets/(.*)$",
    "<THIRD_PARTY_MODULES>",
    "^@japa/(.*)$",
    "^@adonisjs/(.*)$",
    "^@nestjs/(.*)$",
    "^@/(.*)$",
    "^#(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  plugins: [
    require.resolve("prettier-plugin-packagejson"),
    require.resolve("@trivago/prettier-plugin-sort-imports"),
    require.resolve("prettier-plugin-tailwindcss"),
  ],
  singleQuote: false,
} as const satisfies Options;
