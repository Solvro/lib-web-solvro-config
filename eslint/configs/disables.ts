import type { Linter } from "eslint";

import { GLOB_SRC, GLOB_SRC_EXT } from "../globs";

export function disables(): Linter.Config[] {
  return [
    {
      files: [`**/scripts/${GLOB_SRC}`],
      name: "solvro/disables/scripts",
      rules: {
        "antfu/no-top-level-await": "off",
        "no-console": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
      },
    },
    {
      rules: {
        "prettier/prettier": "off",
      },
    },
    {
      files: [`**/cli/${GLOB_SRC}`, `**/cli.${GLOB_SRC_EXT}`],
      name: "solvro/disables/cli",
      rules: {
        "antfu/no-top-level-await": "off",
        "no-console": "off",
      },
    },
    {
      files: ["**/bin/**/*", `**/bin.${GLOB_SRC_EXT}`],
      name: "solvro/disables/bin",
      rules: {
        "antfu/no-import-dist": "off",
        "antfu/no-import-node-modules-by-path": "off",
      },
    },
    {
      files: ["**/*.d.?([cm])ts"],
      name: "solvro/disables/dts",
      rules: {
        "eslint-comments/no-unlimited-disable": "off",
        "import-x/no-duplicates": "off",
        "no-restricted-syntax": "off",
        "unused-imports/no-unused-vars": "off",
      },
    },
    {
      files: ["**/*.js", "**/*.cjs"],
      name: "solvro/disables/cjs",
      rules: {
        "@typescript-eslint/no-require-imports": "off",
      },
    },
    {
      files: [`**/*.config.${GLOB_SRC_EXT}`, `**/*.config.*.${GLOB_SRC_EXT}`],
      name: "antfu/disables/config-files",
      rules: {
        "antfu/no-top-level-await": "off",
        "no-console": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
      },
    },
  ];
}
