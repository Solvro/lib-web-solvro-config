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

const eslintConfigNames = [
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.yaml",
  ".eslintrc.yml",
  ".eslintrc.json",
  ".eslintrc",
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  "eslint.config.mts",
  "eslint.config.cts",
];

export const installEslint = async () => {
  const root = gitRoot();
  const packageJsonPath = path.join(root, "package.json");

  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

  const eslintVersion = packageJson.devDependencies?.eslint;

  if (typeof eslintVersion !== "string") {
    const isConfirmed = await p.confirm({
      message: `Eslint nie jest zainstalowany. Czy chcesz go zainstalować?`,
    });

    if (!isConfirmed) {
      p.cancel("Zainstaluj Eslint i spróbuj ponownie.");
      process.exit(1);
    }
    const spinner = p.spinner();
    spinner.start("Instalowanie Eslint");
    await $$`npm i -D eslint`;
    spinner.stop("Eslint zainstalowany");
  } else if (!semver.satisfies(eslintVersion, ">=9")) {
    const isConfirmed = await p.confirm({
      message: `Eslint jest zainstalowany, ale trzeba go zaktualizować. Czy chcesz zaktualizować?`,
    });

    if (!isConfirmed) {
      p.cancel("Zaktualizuj Eslint i spróbuj ponownie.");
      process.exit(1);
    }
    const spinner = p.spinner();

    spinner.start("Aktualizowanie Eslinta");
    await $$`npm i -D eslint@latest`;
    spinner.stop("Eslint zaktualizowany");
  }

  const eslintConfig = eslintConfigNames.find((configName) =>
    fs
      .access(path.join(root, configName))
      .then(() => true)
      .catch(() => false),
  );

  if (eslintConfig) {
    const isConfirmed = await p.confirm({
      message: `Znaleziono plik konfiguracyjny Eslint. Czy chcesz go nadpisać?`,
    });

    if (!isConfirmed) {
      p.cancel("Nadpisz plik konfiguracyjny Eslint i spróbuj ponownie.");
      process.exit(1);
    }

    await fs.rm(path.join(root, eslintConfig));
  }

  await fs.writeFile(
    path.join(gitRoot(), "eslint.config.js"),
    `import { solvro } from "@solvro/config/eslint";

export default solvro();
`,
  );

  p.note("Plik konfiguracyjny Eslint został utworzony.");
};
