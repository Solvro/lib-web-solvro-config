import * as p from "@clack/prompts";
import { $ } from "execa";
import { getPackageInfo, loadPackageJSON } from "local-pkg";
import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";
import semver from "semver";

import { gitRoot } from "../utils/git-root";
import { polishConfirm } from "../utils/polish-confirm";

const $$ = $({
  cwd: gitRoot(),
  stdout: ["pipe", "inherit"],
});

const prettierConfigNames = [
  ".prettierrc.js",
  ".prettierrc.cjs",
  ".prettierrc.yaml",
  ".prettierrc.yml",
  ".prettierrc.json",
  ".prettierrc",
  "prettier.config.js",
  "prettier.config.mjs",
  "prettier.config.cjs",
  "prettier.config.ts",
  "prettier.config.mts",
  "prettier.config.cts",
];

export const installPrettier = async () => {
  const root = gitRoot();
  const packageJsonPath = path.join(root, "package.json");

  const prettier = await getPackageInfo("prettier");

  if (typeof prettier?.version !== "string") {
    const isConfirmed = await polishConfirm({
      message: `Prettier nie jest zainstalowany. Czy chcesz go zainstalować?`,
    });

    if (!isConfirmed || p.isCancel(isConfirmed)) {
      p.cancel("Zainstaluj Prettiera i spróbuj ponownie.");
      process.exit(1);
    }
    const spinner = p.spinner();
    spinner.start("Instalowanie Prettiera");
    await $$`npm i -D prettier`;
    spinner.stop("Prettiera zainstalowany");
  } else if (!semver.satisfies(prettier.version, ">=3")) {
    const isConfirmed = await polishConfirm({
      message: `Prettier jest zainstalowany, ale trzeba go zaktualizować. Czy chcesz zaktualizować?`,
    });

    if (p.isCancel(isConfirmed) || !isConfirmed) {
      p.cancel("Zaktualizuj Prettiera i spróbuj ponownie.");
      process.exit(1);
    }
    const spinner = p.spinner();

    spinner.start("Aktualizowanie Prettiera");
    await $$`npm i -D eslint@latest`;
    spinner.stop("Prettier zaktualizowany");
  }

  const prettierConfig = prettierConfigNames.find((configName) =>
    existsSync(path.join(root, configName)),
  );

  const packageJson = await loadPackageJSON();

  if (!packageJson) {
    p.cancel("Nie znaleziono pliku package.json.");
    process.exit(1);
  }

  const solvroPrettierPath = "@solvro/config/prettier";

  if (prettierConfig || packageJson.prettier) {
    if (packageJson.prettier === solvroPrettierPath) {
      p.note("Konfiguracja Prettiera jest już ustawiona. Pomijam.");
      return;
    }

    const isConfirmed = await polishConfirm({
      message: `Znaleziono konfigurację Prettiera. Czy chcesz ją nadpisać?`,
    });

    if (!isConfirmed || p.isCancel(isConfirmed)) {
      p.cancel("Usuń konfiguracje Prettiera i spróbuj ponownie.");
      process.exit(1);
    }

    for (const configName of prettierConfigNames) {
      await fs.rm(path.join(root, configName)).catch(() => null);
    }
  }

  const newPackageJson = await loadPackageJSON();

  if (!newPackageJson) {
    p.cancel("Nie znaleziono pliku package.json.");
    process.exit(1);
  }

  newPackageJson.prettier = solvroPrettierPath;

  await fs.writeFile(packageJsonPath, JSON.stringify(newPackageJson, null, 2));

  p.note("Konfiguracja Prettiera została dodana.");
};
