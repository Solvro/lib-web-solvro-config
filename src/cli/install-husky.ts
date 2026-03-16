import assert from "node:assert";

import { PackageJson } from "../utils/package-json";

const packageJson = new PackageJson();

export const installHusky = async () => {
  if (!(await packageJson.hasPackage("husky"))) {
    await packageJson.install("husky", { dev: true });
    await packageJson.localExecute("husky", "init");
  }

  await packageJson.load();

  assert.ok(packageJson.json !== null);

  packageJson.json.scripts = packageJson.json.scripts ?? {};
  packageJson.json.scripts.prepare = `husky || true`;

  await packageJson.save();
};
