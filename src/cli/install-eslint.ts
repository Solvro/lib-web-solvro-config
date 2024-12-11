import * as p from "@clack/prompts";
import { $ } from "execa";
import { getPackageInfo } from "local-pkg";
import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";
import semver from "semver";

import { gitRoot } from "../utils/git-root";
import { polishConfirm } from "../utils/polish-confirm";

const $$ = $({
  cwd: gitRoot(),
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

  const eslint = await getPackageInfo("eslint");

  if (typeof eslint?.version !== "string") {
    const isConfirmed = await polishConfirm({
      message: `Eslint nie jest zainstalowany. Czy chcesz go zainstalować?`,
    });

    if (p.isCancel(isConfirmed) || !isConfirmed) {
      p.cancel("Zainstaluj Eslint i spróbuj ponownie.");
      process.exit(1);
    }

    const spinner = p.spinner();
    spinner.start("Instalowanie Eslint");
    await $$`npm i -D eslint`;
    spinner.stop("Eslint zainstalowany");
  } else if (!semver.satisfies(eslint.version, ">=9")) {
    const isConfirmed = await polishConfirm({
      message: `Eslint jest zainstalowany, ale trzeba go zaktualizować. Czy chcesz zaktualizować?`,
    });

    if (p.isCancel(isConfirmed) || !isConfirmed) {
      p.cancel("Zaktualizuj Eslint i spróbuj ponownie.");
      process.exit(1);
    }
    const spinner = p.spinner();

    spinner.start("Aktualizowanie Eslinta");
    await $$`npm i -D eslint@latest`;
    spinner.stop("Eslint zaktualizowany");
  }

  const eslintConfig = eslintConfigNames.find((configName) =>
    existsSync(path.join(root, configName)),
  );

  if (eslintConfig !== undefined) {
    const eslintContent = await fs.readFile(
      path.join(root, eslintConfig),
      "utf-8",
    );

    if (eslintContent.includes("export default solvro(")) {
      p.note("Eslint jest już skonfigurowany. Pomijam.");

      return;
    } else {
      const isConfirmed = await polishConfirm({
        message: `Znaleziono plik konfiguracyjny Eslint. Czy chcesz go nadpisać?`,
      });

      if (p.isCancel(isConfirmed) || !isConfirmed) {
        p.cancel("Nadpisz plik konfiguracyjny Eslint i spróbuj ponownie.");
        process.exit(1);
      }

      await fs.rm(path.join(root, eslintConfig));
    }
  }

  await fs.writeFile(
    path.join(gitRoot(), "eslint.config.js"),
    `import { solvro } from "@solvro/config/eslint";

export default solvro();
`,
  );

  p.note("Plik konfiguracyjny Eslint został utworzony.");
};
