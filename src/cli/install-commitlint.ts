import { writeFile } from "node:fs/promises";
import path from "node:path";

import { gitRoot } from "../utils/git-root";
import { PackageJson } from "../utils/package-json";
import { installHusky } from "./install-husky";
import { commitlint } from "./templates/commitlint";

const root = gitRoot();

const packageJson = new PackageJson();

export const installCommitLint = async () => {
  await installHusky();

  await packageJson.install("@commitlint/cli", { dev: true });

  await writeFile(
    path.join(root, ".husky/commit-msg"),
    'npx commitlint --edit "$1"\n',
  );

  await writeFile(path.join(root, ".commitlintrc.js"), commitlint());
};
