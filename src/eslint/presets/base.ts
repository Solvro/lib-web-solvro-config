import gitignore from "eslint-config-flat-gitignore";
import type { ConfigWithExtends } from "typescript-eslint";

import { comments } from "../configs/comments";
import { disables } from "../configs/disables";
import { formatters } from "../configs/formatters";
import { ignores } from "../configs/ignores";
import { javascript } from "../configs/javascript";
import { jsdoc } from "../configs/jsdoc";
import { typescriptRelaxed } from "../configs/typescript-relaxed";

export const basePreset = (): ConfigWithExtends[] => [
  gitignore(),
  ...javascript(),
  ...jsdoc(),
  ...comments(),
  ...typescriptRelaxed(),
];

export const defaultOverridesPreset = (): ConfigWithExtends[] => [
  ...ignores(),
  ...formatters(),
  ...disables(),
];
