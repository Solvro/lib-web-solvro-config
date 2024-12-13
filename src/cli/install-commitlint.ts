import { writeFile } from "fs/promises";
import path from "path";

import { $$ } from "../utils/$$";
import { gitRoot } from "../utils/git-root";
import { PackageJson } from "../utils/package-json";
import { commitlint } from "./templates/commitlint";

const root = gitRoot();

const packageJson = new PackageJson();

export const installCommitLint = async () => {
  if (!(await packageJson.hasPackage("husky"))) {
    await packageJson.install("husky", { dev: true });
    await $$`npx husky init`;
  }

  await packageJson.install("@commitlint/cli", { dev: true });
  await packageJson.install("@commitlint/config-conventional", { dev: true });

  await writeFile(
    path.join(root, ".husky/commit-msg"),
    'npx commitlint --edit "$1"\n',
  );

  await writeFile(path.join(root, ".commitlintrc.js"), commitlint());
};
