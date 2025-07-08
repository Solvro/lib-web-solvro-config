import { findUpSync } from "find-up-simple";
import { execSync } from "node:child_process";

export const gitRoot = () => {
  try {
    const root = execSync("git rev-parse --show-toplevel").toString().trim();
    return root;
  } catch {
    // Fallback: find up package-lock.json if not in a git repo
    const packageLockPath = findUpSync("package-lock.json");

    if (packageLockPath !== undefined) {
      return packageLockPath.replace("/package-lock.json", "");
    }

    // Final fallback to current directory
    return process.cwd();
  }
};
