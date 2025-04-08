import gitignore from "eslint-config-flat-gitignore";
import { findUpSync } from "find-up-simple";
import { isPackageListed } from "local-pkg";
import path from "node:path";
import tseslint from "typescript-eslint";
import type { ConfigWithExtends } from "typescript-eslint";

import { configApp } from "@adonisjs/eslint-config";

import { a11y } from "./configs/a11y";
import { comments } from "./configs/comments";
import { disables } from "./configs/disables";
import { formatters } from "./configs/formatters";
import { ignores } from "./configs/ignores";
import { imports } from "./configs/imports";
import { javascript } from "./configs/javascript";
import { jsdoc } from "./configs/jsdoc";
import { node } from "./configs/node";
import { react } from "./configs/react";
import { typescriptRelaxed } from "./configs/typescript-relaxed";
import { typescriptStrict } from "./configs/typescript-strict";
import { unicorn } from "./configs/unicorn";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const builtinAdonisConfig: ConfigWithExtends[] = configApp();

const adonisConfig: ConfigWithExtends[] = [
  ...builtinAdonisConfig,
  ...node(),
  ...imports(),
  {
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: ["enum", "enumMember", "class", "interface", "typeLike"],
          format: ["PascalCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: ["classProperty", "classMethod", "method", "variableLike"],
          format: ["camelCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
      ],
    },
  },
];

const reactConfig = async (): Promise<ConfigWithExtends[]> => [
  ...a11y(),
  ...unicorn(),
  ...typescriptStrict(),
  ...imports({ forbidDefaultExport: true }),
  ...(await react()),
];

const configs: ConfigWithExtends[] = [
  gitignore(),
  ...javascript(),
  ...jsdoc(),
  ...comments(),
  ...typescriptRelaxed(),
];

const defaultOverrides = [...ignores(), ...formatters(), ...disables()];

export const solvro = async (...overrides: ConfigWithExtends[]) => {
  const isAdonis = await isPackageListed("@adonisjs/core");
  const isReact = await isPackageListed("react");

  if (isReact && isAdonis) {
    throw new Error("You can't use both Adonis and React in the same project");
  }

  const newConfig: ConfigWithExtends[] = [];

  if (isAdonis) {
    newConfig.push(...adonisConfig);
  }

  if (isReact) {
    newConfig.push(...(await reactConfig()));
  }

  const tsConfigPath = findUpSync("tsconfig.json", {
    cwd: process.cwd(),
  });

  if (tsConfigPath == null) {
    throw new Error("No tsconfig.json found");
  }

  const rootDirectory = path.dirname(tsConfigPath);

  configs.push({
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: rootDirectory,
      },
    },
  });

  return tseslint.config(
    ...configs,
    ...newConfig,
    ...defaultOverrides,
    ...overrides,
  );
};
