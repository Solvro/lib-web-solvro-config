import assert from "assert";

import { $$ } from "../utils/$$";
import { PackageJson } from "../utils/package-json";

const packageJson = new PackageJson();

export const installHusky = async () => {
  if (!(await packageJson.hasPackage("husky"))) {
    await packageJson.install("husky", { dev: true });
    await $$`npx husky init`;

    await packageJson.load();

    assert(packageJson.json !== null);

    if (packageJson.json.scripts?.husky !== undefined) {
      packageJson.json.scripts.husky = `husky || true`;
    }

    await packageJson.save();
  }
};
