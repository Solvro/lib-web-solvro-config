import { configApp } from "@adonisjs/eslint-config";
import { isPackageExists } from "local-pkg";
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
import { typescriptAdonis } from "./configs/typescript-adonis";
import { typescriptNext } from "./configs/typescript-next";
import { unicorn } from "./configs/unicorn";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const adonisConfig = [...configApp(), ...node(), ...typescriptAdonis()];

const nextjsConfig = [
  ...react(),
  ...a11y(),
  ...unicorn(),
  ...imports(),
  ...typescriptNext(),
];

export const solvro = (...overrides: ConfigWithExtends[]) => {
  const isAdonis = isPackageExists("@adonisjs/core");
  const isNext = isPackageExists("next");

  const configs = [...javascript(), ...jsdoc(), ...comments()];

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    configs.push(...adonisConfig);
  }

  if (isNext) {
    configs.push(...nextjsConfig);
  }

  return tseslint.config(configs, ...defaultOverrides);
};
