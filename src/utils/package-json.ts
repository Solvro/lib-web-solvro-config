import * as p from "@clack/prompts";
import { getPackageInfo, isPackageListed, loadPackageJSON } from "local-pkg";
import assert from "node:assert";
import { stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { getUserAgent } from "package-manager-detector/detect";
import c from "picocolors";
import semver from "semver";

import type { PackageManager, PackageManagerConfig } from "../constants";
import { PACKAGE_MANAGER_CONFIGS } from "../constants";
import { $$ } from "./$$";
import { projectRoot } from "./git-root";
import { isSupportedPackageManager } from "./is-supported-package-manager";
import { runWithSpinner } from "./run-with-spinner";
import { warnInconsistentUserAgent } from "./warn-inconsistent-user-agent";
import { warnMissingLockfile } from "./warn-missing-lockfile";
import { warnUnsupportedPackageManager } from "./warn-unsupported-package-manager";

export class PackageJson {
  public json: Awaited<ReturnType<typeof loadPackageJSON>> = null;
  private _manager: PackageManagerConfig | null = null;

  /** Checks if the process is run from a supported package manager */
  public verifyPackageManager(): PackageManager {
    const userAgent = getUserAgent();
    if (!isSupportedPackageManager(userAgent)) {
      warnUnsupportedPackageManager({ userAgent });
      process.exit(1);
    }
    return userAgent;
  }

  /** Checks if the user agent is consistent with the project's package manager */
  public async validateUserAgentConsistency() {
    if (this.json?.packageManager != null) {
      const [detectedPackageManager] = this.json.packageManager.split("@");
      if (detectedPackageManager !== this.manager.name) {
        warnInconsistentUserAgent({
          userAgent: this.manager,
          detectedPackageManager,
        });
        process.exit(1);
      }
    }
    const lockfilePath = path.join(projectRoot(), this.manager.lockfile);
    try {
      await stat(lockfilePath);
    } catch {
      warnMissingLockfile({ manager: this.manager });
      process.exit(1);
    }
  }

  // use a cached getter to avoid premature exits on importing a file with a toplevel construction
  public get manager(): PackageManagerConfig {
    if (this._manager == null) {
      const userAgent = this.verifyPackageManager();
      this._manager = PACKAGE_MANAGER_CONFIGS[userAgent];
    }
    return this._manager;
  }

  async load() {
    const json = await loadPackageJSON(projectRoot());

    if (json === null) {
      p.cancel(
        `Nie znaleziono pliku ${c.cyan("package.json")}. Upewnij się, że jesteś w katalogu projektu.`,
      );
      process.exit(1);
    }

    this.json = json;
  }

  hasPackage(package_: string) {
    return isPackageListed(package_);
  }

  async isNextJs() {
    return this.hasPackage("next");
  }

  async getPackageInfo(package_: string) {
    return getPackageInfo(package_);
  }

  async doesSatisfy(package_: string, version: string) {
    await this.load();

    assert.ok(this.json !== null);

    const packageInfo = await this.getPackageInfo(package_);

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
      p.cancel(
        `Projekty korzystające zarówno z ${c.magenta("Adonis")}a jak i ${c.cyan("React")}a nie są wspierane.`,
      );
      process.exit(1);
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
      path.join(projectRoot(), "package.json"),
      `${JSON.stringify(this.json, null, 2)}\n`,
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
    options: {
      version?: string;
      dev?: boolean;
      alwaysUpdate?: boolean;
    } = {},
  ) {
    const isInstalled = await this.hasPackage(package_);
    const installVersion = options.version ?? "latest";
    const [installCommand, ...commandOptions] =
      this.manager.installPackage.split(" ");
    if (options.dev === true) {
      commandOptions.push("-D");
    }
    if (!isInstalled) {
      await runWithSpinner({
        start: `Instalowanie pakietu ${package_}`,
        stop: `${package_} zainstalowany 😍`,
        error: `Instalacja pakietu ${package_} nie powiodła się 🥶`,
        callback: async () => {
          await $$(installCommand, [
            ...commandOptions,
            `${package_}@${installVersion}`,
          ]);
        },
      });

      await this.load();

      return;
    }

    if (
      options.alwaysUpdate === true ||
      (options.version != null &&
        !(await this.doesSatisfy(package_, options.version)))
    ) {
      await runWithSpinner({
        start: `Aktualizowanie pakietu ${package_}`,
        stop: `${package_} zaktualizowany 😍`,
        error: `Aktualizacja pakietu ${package_} nie powiodła się 🥶`,
        callback: async () => {
          await $$(installCommand, [
            ...commandOptions,
            `${package_}@${installVersion}`,
          ]);
        },
      });

      await this.load();
    }
  }

  async localExecute(...commandArguments: string[]) {
    const [command, ...commandOptions] = this.manager.localExecute.split(" ");
    const options = [...commandOptions, ...commandArguments];
    await $$(command, options);
  }

  async clearInstall() {
    const [command, ...options] = this.manager.cleanInstall.split(" ");
    await $$(command, options);
  }
}
