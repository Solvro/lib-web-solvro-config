import { execSync } from "node:child_process";

export function isGitClean(): boolean {
  try {
    execSync("git diff-index --quiet HEAD --");
    return true;
  } catch {
    return false;
  }
}
