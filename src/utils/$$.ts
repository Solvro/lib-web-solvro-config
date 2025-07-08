import type { ExecaScriptMethod } from "execa";

import { gitRoot } from "./git-root";

let cachedExeca: ExecaScriptMethod | null = null;

export const $$ = (async (...arguments_: Parameters<ExecaScriptMethod>) => {
  if (cachedExeca === null) {
    const { $ } = await import("execa");
    cachedExeca = $({
      cwd: gitRoot(),
    });
  }
  return cachedExeca(...arguments_);
}) as ExecaScriptMethod;
