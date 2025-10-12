import type { ConfigWithExtends } from "@eslint/config-helpers";

import { imports } from "../configs/imports";
import { node } from "../configs/node";
import { typescriptStrict } from "../configs/typescript-strict";
import { unicorn } from "../configs/unicorn";

export const nodePreset = (): ConfigWithExtends[] => [
  ...node(),
  ...unicorn(),
  ...typescriptStrict(),
  ...imports({ forbidDefaultExport: true }),
];
