import * as p from "@clack/prompts";
import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import c from "picocolors";

import { dependenciesMap, pkgJson } from "../constants";
import type { PromptResult } from "../types";

export async function updatePackageJson(result: PromptResult): Promise<void> {
  const cwd = process.cwd();

  const pathPackageJSON = path.join(cwd, "package.json");

  p.log.step(c.cyan(`Bumping @solvro/config to v${pkgJson.version}`));

  const pkgContent = await fsp.readFile(pathPackageJSON, "utf-8");
  const pkg: Record<string, any> = JSON.parse(pkgContent);

  pkg.devDependencies ??= {};
  pkg.devDependencies["@solvro/config"] = `^${pkgJson.version}`;
  pkg.devDependencies.eslint ??= pkgJson.devDependencies.eslint
    .replace("npm:eslint-ts-patch@", "")
    .replace(/-\d+$/, "");

  const addedPackages: string[] = [];

  for (const framework of result.frameworks) {
    const deps = dependenciesMap[framework];
    if (deps) {
      deps.forEach((f) => {
        pkg.devDependencies[f] = pkgJson.devDependencies[f];
        addedPackages.push(f);
      });
    }
  }

  if (addedPackages.length)
    p.note(`${c.dim(addedPackages.join(", "))}`, "Added packages");

  await fsp.writeFile(pathPackageJSON, JSON.stringify(pkg, null, 2));
  p.log.success(c.green(`Changes wrote to package.json`));
}
