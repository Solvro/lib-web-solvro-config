import assert from "node:assert";
import { writeFile } from "node:fs/promises";
import path from "node:path";

import { projectRoot } from "../utils/git-root";
import { PackageJson } from "../utils/package-json";
import { installHusky } from "./install-husky";

const packageJson = new PackageJson();

export const installLintStaged = async () => {
  await packageJson.load();

  assert.ok(packageJson.json !== null);

  await installHusky();

  await packageJson.install("lint-staged", { dev: true });

  await writeFile(
    path.join(projectRoot(), ".husky/pre-commit"),
    `${packageJson.manager.localExecute} lint-staged\n`,
  );

  packageJson.json["lint-staged"] = {
    "*": "prettier -w --ignore-unknown",
  };

  await packageJson.save();
};
