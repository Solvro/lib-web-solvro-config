import type { ConfigWithExtends } from "typescript-eslint";

import { GLOB_EXCLUDE } from "../globs";

export function ignores(): ConfigWithExtends[] {
  return [
    {
      ignores: [...GLOB_EXCLUDE],
      name: "solvro/ignores",
    },
  ];
}
