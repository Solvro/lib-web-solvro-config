import type { Linter } from "eslint";

import { GLOB_EXCLUDE } from "../globs";

export function ignores(): Linter.Config[] {
  return [
    {
      ignores: [...GLOB_EXCLUDE],
      name: "solvro/ignores",
    },
  ];
}
