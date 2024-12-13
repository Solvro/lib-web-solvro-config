import assert from "assert";
import { writeFile } from "fs/promises";

import { $$ } from "../utils/$$";
import { PackageJson } from "../utils/package-json";

const packageJson = new PackageJson();

export const installLintStaged = async () => {
  await packageJson.load();

  assert(packageJson.json !== null);

  if (!(await packageJson.hasPackage("husky"))) {
    await packageJson.install("husky", { dev: true });
    await $$`npx husky init`;
  }

  await packageJson.install("lint-staged", { dev: true });

  await writeFile(".husky/pre-commit", "npx lint-staged\n");

  packageJson.json["lint-staged"] = {
    "*": "prettier -w --ignore-unknown",
  };

  await packageJson.save();
};
