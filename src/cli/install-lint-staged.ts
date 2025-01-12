import assert from "assert";
import { writeFile } from "fs/promises";

import { PackageJson } from "../utils/package-json";
import { installHusky } from "./install-husky";

const packageJson = new PackageJson();

export const installLintStaged = async () => {
  await packageJson.load();

  assert(packageJson.json !== null);

  await installHusky();

  await packageJson.install("lint-staged", { dev: true });

  await writeFile(".husky/pre-commit", "npx lint-staged\n");

  packageJson.json["lint-staged"] = {
    "*": "prettier -w --ignore-unknown",
  };

  await packageJson.save();
};
