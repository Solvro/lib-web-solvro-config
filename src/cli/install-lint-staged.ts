import * as p from "@clack/prompts";
import { $ } from "execa";
import { writeFile } from "fs/promises";
import { isPackageListed, loadPackageJSON } from "local-pkg";
import path from "path";

import { gitRoot } from "../utils/git-root";

const $$ = $({
  cwd: gitRoot(),
  stdout: ["pipe", "inherit"],
});

export const installLintStaged = async () => {
  const lintStaged = await isPackageListed("lint-staged");
  const husky = await isPackageListed("husky");

  if (!lintStaged) {
    const spinner = p.spinner();

    spinner.start("Instalowanie lint-staged");
    await $$`npm i -D lint-staged`;
    spinner.stop("lint-staged zainstalowany");
  }

  if (!husky) {
    const spinner = p.spinner();

    spinner.start("Instalowanie husky");
    await $$`npm i -D husky`;
    await $`npx husky init`;
    spinner.stop("husky zainstalowany");
  }

  await writeFile(".husky/pre-commit", "npx lint-staged\n");

  const packageJson = await loadPackageJSON(gitRoot());

  if (!packageJson) {
    p.cancel(
      "Nie znaleziono package.json. Upewnij się, że jesteś w katalogu projektu.",
    );
    process.exit(1);
  }

  packageJson["lint-staged"] = {
    "*": "prettier -w --ignore-unknown",
  };

  await writeFile(
    path.join(gitRoot(), "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  p.note("Dodano automatyczne formatowanie przy commicie.");
};
