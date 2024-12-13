import * as p from "@clack/prompts";
import { $ } from "execa";
import {
  getPackageInfo,
  isPackageExists,
  isPackageListed,
  loadPackageJSON,
} from "local-pkg";
import assert from "node:assert";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import semver from "semver";

import { gitRoot } from "./git-root";
import { polishConfirm } from "./polish-confirm";

const $$ = $({
  cwd: gitRoot(),
});

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

  hasPackage(pkg: string) {
    return isPackageListed(pkg);
  }

  async doesSatisfies(pkg: string, version: string) {
    await this.load();

    assert(this.json !== null);

    if (this.json.dependencies?.[pkg] === undefined) {
      return false;
    }

    return semver.satisfies(this.json.dependencies[pkg], version);
  }

  async ensureESM() {
    await this.load();

    const isConfirmed = await polishConfirm({
      message: `Twój projekt nie używa ESM (brak type: "module" w package.json). Czy chcesz to dodać? (Wymagane by kontynuować)`,
    });

    if (p.isCancel(isConfirmed) || !isConfirmed) {
      p.cancel("Zmień projekt na ESM i spróbuj ponownie.");
      process.exit(1);
    }

    assert(this.json !== null);

    this.json.type = "module";

    await this.save();
  }

  async getProjectType() {
    const isAdonis = isPackageExists("@adonisjs/core");
    const isNext = isPackageExists("next");

    if (isNext && isAdonis) {
      throw new Error(
        "You can't use both Adonis and Next.js in the same project",
      );
    }

    if (isAdonis) {
      return "adonis";
    }

    if (isNext) {
      return "next";
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

    assert(this.json !== null);

    if (this.json.scripts?.[name] !== undefined) {
      return;
    }

    this.json.scripts = this.json.scripts ?? {};
    this.json.scripts[name] = script;

    await this.save();
  }

  async install(pkg: string, options?: { minVersion?: string; dev?: boolean }) {
    const info = await getPackageInfo(pkg);

    if (info?.version !== undefined && options?.minVersion !== undefined) {
      if (!semver.satisfies(info.version, options.minVersion)) {
        const spinner = p.spinner();
        spinner.start(`Aktualizowanie ${pkg}`);
        await $$`npm i ${options.dev === true ? "-D" : ""}@latest ${pkg}`;
        spinner.stop(`${pkg} zaktualizowany 😍`);

        await this.load();

        return;
      } else {
        return;
      }
    }

    if (info !== undefined) {
      return;
    }

    const spinner = p.spinner();
    spinner.start(`Instalowanie ${pkg}`);
    await $$`npm i ${options?.dev === true ? "-D" : ""}@latest ${pkg}`;
    spinner.stop(`${pkg} zainstalowany 😍`);

    await this.load();
  }
}