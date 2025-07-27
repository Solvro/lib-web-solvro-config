import type { ExecaScriptMethod } from "execa";

import { projectRoot } from "./git-root";

let cachedExeca: ExecaScriptMethod | null = null;

export const $$ = (async (...arguments_: Parameters<ExecaScriptMethod>) => {
  if (cachedExeca === null) {
    const { $ } = await import("execa");
    cachedExeca = $({
      cwd: projectRoot(),
    });
  }
  return cachedExeca(...arguments_);
}) as ExecaScriptMethod;
