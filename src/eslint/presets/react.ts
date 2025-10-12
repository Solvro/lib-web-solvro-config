import type { ConfigWithExtends } from "@eslint/config-helpers";

import { a11y } from "../configs/a11y";
import { imports } from "../configs/imports";
import { react } from "../configs/react";
import { typescriptStrict } from "../configs/typescript-strict";
import { unicorn } from "../configs/unicorn";

export const reactPreset = async (): Promise<ConfigWithExtends[]> => [
  ...a11y(),
  ...unicorn(),
  ...typescriptStrict(),
  ...imports({ forbidDefaultExport: true }),
  ...(await react()),
];
