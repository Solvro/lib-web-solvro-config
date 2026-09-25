import { findUpSync } from "find-up-simple";
import { execSync } from "node:child_process";
import path from "node:path";

export const projectRoot = () => {
  const packageJsonPath = findUpSync("package.json");

  return packageJsonPath === undefined
    ? process.cwd()
    : path.dirname(packageJsonPath);
};

export const gitRoot = () => {
  try {
    const rootDirectory = execSync("git rev-parse --show-toplevel", {
      cwd: projectRoot(),
    });
    return rootDirectory.toString().trim();
  } catch {
    return projectRoot();
  }
};
