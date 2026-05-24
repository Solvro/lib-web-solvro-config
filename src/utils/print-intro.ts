import * as p from "@clack/prompts";
import { readFileSync } from "node:fs";
import c from "picocolors";

import { isGitClean } from "./is-git-clean";

export const printIntro = () => {
  const packageJsonUrl = new URL("../../package.json", import.meta.url);
  const packageJson = JSON.parse(readFileSync(packageJsonUrl, "utf8"));
  const packageRoot = new URL("../", packageJsonUrl);
  const clean = isGitClean({ cwd: packageRoot, stdio: "ignore" });
  const version = c.green(c.bold(`v${packageJson.version}`));
  const dirtyStatus = clean ? "" : `${c.white(" (dirty)")}`;
  p.intro(
    `  ${c.blueBright(c.bold("@solvro/config"))} ${version}${dirtyStatus}  `,
  );
};
