import type { ConfigWithExtends } from "typescript-eslint";

import { a11y } from "../configs/a11y";
import { imports } from "../configs/imports";
import { react } from "../configs/react";
import { testing } from "../configs/testing";
import { typescriptStrict } from "../configs/typescript-strict";
import { unicorn } from "../configs/unicorn";

export const reactPreset = async (): Promise<ConfigWithExtends[]> => [
  ...a11y(),
  ...unicorn(),
  ...typescriptStrict(),
  ...imports({ forbidDefaultExport: true }),
  ...(await testing({
    testFiles: ["**/*.test.ts", "**/*.test.tsx"],
    playwrightTestFiles: ["**/*.spec.ts", "**/*.spec.tsx"],
  })),
  ...(await react()),
];
