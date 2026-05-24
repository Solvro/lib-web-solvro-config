import { execSync } from "node:child_process";
import type { ExecSyncOptions } from "node:child_process";

export const isInGitRepo = (options: ExecSyncOptions) => {
  try {
    execSync("git rev-parse --is-inside-work-tree ", {
      stdio: "ignore",
      ...options,
    });
    return true;
  } catch {
    return false;
  }
};
