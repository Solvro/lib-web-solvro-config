import * as p from "@clack/prompts";
import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";

import { gitRoot } from "../utils/git-root";
import { PackageJson } from "../utils/package-json";
import { polishConfirm } from "../utils/polish-confirm";

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

export const installEslint = async () => {
  const root = gitRoot();

  await packageJson.load();

  await packageJson.install("eslint", { dev: true, minVersion: ">=9" });

  const type = await packageJson.getProjectType();

  if (type === "react" && (await packageJson.hasPackage("next"))) {
    const is15 = await packageJson.doesSatisfies("next", ">=15");

    if (!is15) {
      p.cancel(
        "Next.js musi być w conajmniej wersji 15. Zaktualizuj Next.js i spróbuj ponownie.\nWięcej informacji tutaj: https://nextjs.org/docs/app/building-your-application/upgrading/version-15",
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
