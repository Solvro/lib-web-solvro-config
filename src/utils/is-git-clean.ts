import { execSync } from "node:child_process";
import type { ExecSyncOptions } from "node:child_process";

export function isGitClean(options?: ExecSyncOptions): boolean {
  try {
    execSync("git diff-index --quiet HEAD --", options);
    return true;
  } catch {
    return false;
  }
}
