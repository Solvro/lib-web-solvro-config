import parser from "@typescript-eslint/parser";
import tseslint, { type ConfigWithExtends } from "typescript-eslint";

import { comments } from "./configs/comments";
import { disables } from "./configs/disables";
import { formatters } from "./configs/formatters";
import { ignores } from "./configs/ignores";
import { imports } from "./configs/imports";
import { javascript } from "./configs/javascript";
import { jsdoc } from "./configs/jsdoc";
import { markdown } from "./configs/markdown";
import { node } from "./configs/node";
import { react } from "./configs/react";
import { typescript } from "./configs/typescript";
import { unicorn } from "./configs/unicorn";

export const solvro = (...configs: ConfigWithExtends[]) =>
  tseslint.config(
    {
      languageOptions: {
        parser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: "../",
        },
      },
    },
    ...react(),
    ...typescript(),
    ...javascript(),
    ...jsdoc(),
    ...unicorn(),
    ...disables(),
    ...imports(),
    ...comments(),
    ...markdown(),
    ...ignores(),
    ...formatters(),
    ...node(),
    ...configs,
  );
