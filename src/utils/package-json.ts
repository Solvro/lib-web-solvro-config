import * as p from "@clack/prompts";
import { getPackageInfo, isPackageListed, loadPackageJSON } from "local-pkg";
import assert from "node:assert";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import semver from "semver";

import { $$ } from "./$$";
import { gitRoot } from "./git-root";

export class PackageJson {
  public json: Awaited<ReturnType<typeof loadPackageJSON>> = null;

  async load() {
    const json = await loadPackageJSON(gitRoot());

    if (json === null) {
      p.cancel(
        "Nie znaleziono package.json. Upewnij się, że jesteś w katalogu projektu.",
      );
      process.exit(1);
    }

    this.json = json;
  }

  hasPackage(package_: string) {
    return isPackageListed(package_);
  }

  async doesSatisfies(package_: string, version: string) {
    await this.load();

    assert.ok(this.json !== null);

    const packageInfo = await getPackageInfo(package_);

    if (packageInfo?.version === undefined) {
      return false;
    }

    return semver.satisfies(packageInfo.version, version);
  }

  async isESM() {
    await this.load();

    assert.ok(this.json !== null);

    return this.json.type === "module";
  }

  async ensureESM() {
    if (await this.isESM()) {
      return;
    }

    assert.ok(this.json !== null);

    this.json.type = "module";

    await this.save();
  }

  async getProjectType() {
    const isAdonis = await isPackageListed("@adonisjs/core");
    const isReact = await isPackageListed("react");
    const isNestJs = await isPackageListed("@nestjs/core");
    if (isReact && isAdonis) {
      throw new Error(
        "You can't use both Adonis and React in the same project",
      );
    }

    if (isNestJs) {
      return "nestjs";
    }

    if (isAdonis) {
      return "adonis";
    }

    if (isReact) {
      return "react";
    }

    return "node";
  }

  async save() {
    await writeFile(
      path.join(gitRoot(), "package.json"),
      JSON.stringify(this.json, null, 2),
    );
  }

  async addScriptIfNotExists(name: string, script: string) {
    await this.load();

    assert.ok(this.json !== null);

    if (this.json.scripts?.[name] !== undefined) {
      return;
    }

    this.json.scripts = this.json.scripts ?? {};
    this.json.scripts[name] = script;

    await this.save();
  }

  async install(
    package_: string,
    options?: { minVersion?: string; dev?: boolean; alwaysUpdate?: boolean },
  ) {
    const isInstalled = await this.hasPackage(package_);

    if (!isInstalled) {
      const spinner = p.spinner();
      spinner.start(`Instalowanie ${package_}`);
      await $$`npm i ${options?.dev === true ? "-D" : ""} ${package_}@latest`;
      spinner.stop(`${package_} zainstalowany 😍`);

      await this.load();

      return;
    }

    const info = await getPackageInfo(package_);

    if (
      (info?.version !== undefined &&
        options?.minVersion !== undefined &&
        !semver.satisfies(info.version, options.minVersion)) ||
      options?.alwaysUpdate === true
    ) {
      const spinner = p.spinner();
      spinner.start(`Aktualizowanie ${package_}`);
      await $$`npm i ${options.dev === true ? "-D" : ""} ${package_}@latest`;
      spinner.stop(`${package_} zaktualizowany 😍`);

      await this.load();
    }
  }
}
