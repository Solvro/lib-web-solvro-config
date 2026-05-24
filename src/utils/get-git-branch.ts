import { execSync } from "node:child_process";
import type { ExecSyncOptions } from "node:child_process";

export function getGitBranch(options?: ExecSyncOptions): string | null {
  try {
    const result = execSync(
      "git symbolic-ref --quiet --short HEAD || git rev-parse --short HEAD",
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        ...options,
      },
    );

    const branch = result.toString().trim();
    return branch === "" ? null : branch;
  } catch {
    return null;
  }
}
