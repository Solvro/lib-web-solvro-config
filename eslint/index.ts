import { configApp } from "@adonisjs/eslint-config";
import { findUpSync } from "find-up-simple";
import { isPackageExists } from "local-pkg";
import path from "node:path";
import tseslint from "typescript-eslint";
import type { ConfigWithExtends } from "typescript-eslint";

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

const adonisConfig: ConfigWithExtends[] = [...builtinAdonisConfig, ...node()];

const nextjsConfig: ConfigWithExtends[] = [
  ...imports(),
  ...a11y(),
  ...unicorn(),
  ...typescriptStrict(),
  ...react(),
];

export const solvro = (...overrides: ConfigWithExtends[]) => {
  const isAdonis = isPackageExists("@adonisjs/core");
  const isNext = isPackageExists("next");

  const configs: ConfigWithExtends[] = [
    ...javascript(),
    ...jsdoc(),
    ...comments(),
    ...typescriptRelaxed(),
  ];

  const defaultOverrides = [
    ...ignores(),
    ...formatters(),
    ...disables(),
    ...overrides,
  ];

  if (isNext && isAdonis) {
    throw new Error(
      "You can't use both Adonis and Next.js in the same project",
    );
  }
  if (isAdonis) {
    configs.push(...adonisConfig);
  }

  if (isNext) {
    configs.push(...nextjsConfig);
  }

  const tsConfigPath = findUpSync("tsconfig.json", {
    cwd: process.cwd(),
  });

  if (tsConfigPath == null) {
    throw new Error("No tsconfig.json found");
  }

  const rootDir = path.dirname(tsConfigPath);

  configs.push({
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: rootDir,
      },
    },
  });

  return tseslint.config(configs, ...defaultOverrides);
};
