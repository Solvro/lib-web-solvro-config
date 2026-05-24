import { execSync } from "node:child_process";
import type { ExecSyncOptions } from "node:child_process";

export function isGitClean(options?: ExecSyncOptions): boolean {
  try {
    const diff = execSync("git status --porcelain", options);
    return diff.toString().trim() === "";
  } catch {
    return false;
  }
}
