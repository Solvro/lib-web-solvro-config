import * as p from "@clack/prompts";
import c from "picocolors";

import { getGitBranch } from "./get-git-branch";
import { getPackageRoot } from "./get-package-info";
import { isGitClean } from "./is-git-clean";

export const printIntro = (packageVersion: string) => {
  const execOptions = { cwd: getPackageRoot() };
  const version =
    packageVersion == ""
      ? c.red("(nieznana wersja)")
      : c.green(c.bold(`v${packageVersion}`));
  const branchName = getGitBranch(execOptions);
  const dirtyStatus =
    branchName == null
      ? ""
      : c.white(` (${isGitClean(execOptions) ? branchName : "dirty"})`);
  p.intro(
    `  ${c.blueBright(c.bold("@solvro/config"))} ${version}${dirtyStatus}  `,
  );
};
