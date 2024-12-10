import * as p from "@clack/prompts";
import * as eslint from "eslint";
import { $ } from "execa";
import * as fs from "node:fs/promises";
import path from "node:path";
import c from "picocolors";
import semver from "semver";

import { gitRoot } from "../utils/git-root";

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

  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

  const prettierVersion = packageJson.devDependencies?.prettier;

  if (typeof prettierVersion !== "string") {
    const isConfirmed = await p.confirm({
      message: `Prettier nie jest zainstalowany. Czy chcesz go zainstalować?`,
    });

    if (!isConfirmed) {
      p.cancel("Zainstaluj Prettiera i spróbuj ponownie.");
      process.exit(1);
    }
    const spinner = p.spinner();
    spinner.start("Instalowanie Prettiera");
    await $$`npm i -D prettier`;
    spinner.stop("Prettiera zainstalowany");
  } else if (!semver.satisfies(prettierVersion, ">=3")) {
    const isConfirmed = await p.confirm({
      message: `Prettier jest zainstalowany, ale trzeba go zaktualizować. Czy chcesz zaktualizować?`,
    });

    if (!isConfirmed) {
      p.cancel("Zaktualizuj Prettiera i spróbuj ponownie.");
      process.exit(1);
    }
    const spinner = p.spinner();

    spinner.start("Aktualizowanie Prettiera");
    await $$`npm i -D eslint@latest`;
    spinner.stop("Prettier zaktualizowany");
  }

  const prettierConfig = prettierConfigNames.find((configName) =>
    fs
      .access(path.join(root, configName))
      .then(() => true)
      .catch(() => false),
  );

  const packageJsonPrettier = packageJson.prettier;

  if (prettierConfig || packageJsonPrettier) {
    const isConfirmed = await p.confirm({
      message: `Znaleziono konfigurację Prettiera. Czy chcesz ją nadpisać?`,
    });

    if (!isConfirmed) {
      p.cancel("Nadpisz plik konfiguracyjny Eslint i spróbuj ponownie.");
      process.exit(1);
    }

    for (const configName of prettierConfigNames) {
      await fs.rm(path.join(root, configName)).catch(() => {});
    }
  }

  const newPackageJson = JSON.parse(
    await fs.readFile(packageJsonPath, "utf-8"),
  );

  newPackageJson.prettier = "@solvro/config/prettier";

  await fs.writeFile(packageJsonPath, JSON.stringify(newPackageJson, null, 2));

  p.note("Konfiguracja Prettiera została dodana.");
};
