import * as p from "@clack/prompts";
import { readFileSync } from "node:fs";
import c from "picocolors";

import { getGitBranch } from "./get-git-branch";
import { isGitClean } from "./is-git-clean";

export const printIntro = () => {
  const packageJsonUrl = new URL("../../package.json", import.meta.url);
  const packageJson = JSON.parse(readFileSync(packageJsonUrl, "utf8")) as {
    version?: string;
  };
  const packageRoot = new URL("./", packageJsonUrl);
  const execOptions = { cwd: packageRoot };
  const version =
    packageJson.version == null || packageJson.version.trim() === ""
      ? c.red("(unknown version)")
      : c.green(c.bold(`v${packageJson.version}`));
  const branchName = getGitBranch(execOptions);
  const dirtyStatus =
    branchName == null
      ? ""
      : c.white(` (${isGitClean(execOptions) ? branchName : "dirty"})`);
  p.intro(
    `  ${c.blueBright(c.bold("@solvro/config"))} ${version}${dirtyStatus}  `,
  );
};
