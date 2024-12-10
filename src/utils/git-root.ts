import { execSync } from "node:child_process";

export const gitRoot = () => {
  const root = execSync("git rev-parse --show-toplevel").toString().trim();
  return root;
};
