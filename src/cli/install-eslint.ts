import * as p from "@clack/prompts";
import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";

import { projectRoot } from "../utils/git-root";
import { hasUserConfirmed } from "../utils/has-user-confirmed";
import { PackageJson } from "../utils/package-json";

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

const packageJson = new PackageJson();

export const installEslint = async (isNonInteractive = false) => {
  const root = projectRoot();

  await packageJson.load();

  await packageJson.install("eslint", {
    dev: true,
    version: "^10",
  });

  const type = await packageJson.getProjectType();

  if (type === "react" && (await packageJson.isNextJs())) {
    const is15 = await packageJson.doesSatisfy("next", ">=15");

    if (!is15) {
      p.cancel(
        "Next.js musi być w co najmniej wersji 15. Zaktualizuj Next.js i spróbuj ponownie.\nWięcej informacji tutaj: https://nextjs.org/docs/app/building-your-application/upgrading/version-15",
      );
      process.exit(1);
    }

    await packageJson.install("@next/eslint-plugin-next", { dev: true });
  }

  const eslintConfig = eslintConfigNames.find((configName) =>
    existsSync(path.join(root, configName)),
  );

  if (eslintConfig !== undefined) {
    const eslintContent = await fs.readFile(
      path.join(root, eslintConfig),
      "utf8",
    );

    if (eslintContent.includes("export default solvro(")) {
      p.log.warning("ESLint jest już skonfigurowany. Pomijam.");

      return;
    }
    if (isNonInteractive) {
      // In non-interactive mode, automatically overwrite existing config
      await fs.rm(path.join(root, eslintConfig));
    } else {
      const isConfirmed = await hasUserConfirmed({
        message: `Znaleziono plik konfiguracyjny ESLint. Czy chcesz go nadpisać?`,
      });

      if (!isConfirmed) {
        p.cancel("Nadpisz plik konfiguracyjny ESLint i spróbuj ponownie.");
        process.exit(1);
      }

      await fs.rm(path.join(root, eslintConfig));
    }
  }

  const isEsm = await packageJson.isEsm();

  const eslintFilename = isEsm ? "eslint.config.js" : "eslint.config.mjs";

  await fs.writeFile(
    path.join(root, eslintFilename),
    `import { solvro } from "@solvro/config/eslint";

export default solvro();
`,
  );

  p.log.step("Plik konfiguracyjny ESLint został utworzony.");
};
