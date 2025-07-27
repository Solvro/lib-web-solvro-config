import * as p from "@clack/prompts";
import assert from "node:assert";
import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";

import { projectRoot } from "../utils/git-root";
import { PackageJson } from "../utils/package-json";
import { polishConfirm } from "../utils/polish-confirm";

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

const packageJson = new PackageJson();

export const installPrettier = async (isNonInteractive = false) => {
  const root = projectRoot();

  await packageJson.load();
  assert.ok(packageJson.json !== null);

  await packageJson.install("prettier", { dev: true, minVersion: ">=3" });

  const prettierConfig = prettierConfigNames.find((configName) =>
    existsSync(path.join(root, configName)),
  );

  const solvroPrettierPath = "@solvro/config/prettier";

  if (prettierConfig !== undefined || packageJson.json.prettier !== undefined) {
    if (packageJson.json.prettier === solvroPrettierPath) {
      p.note("Konfiguracja Prettiera jest już ustawiona. Pomijam.");
      return;
    }

    if (isNonInteractive) {
      // In non-interactive mode, automatically overwrite existing config
      for (const configName of prettierConfigNames) {
        await fs.rm(path.join(root, configName)).catch(() => null);
      }
    } else {
      const isConfirmed = await polishConfirm({
        message: `Znaleziono konfigurację Prettiera. Czy chcesz ją nadpisać?`,
      });

      if (p.isCancel(isConfirmed) || !isConfirmed) {
        p.cancel("Usuń konfiguracje Prettiera i spróbuj ponownie.");
        process.exit(1);
      }

      for (const configName of prettierConfigNames) {
        await fs.rm(path.join(root, configName)).catch(() => null);
      }
    }
  }

  packageJson.json.prettier = solvroPrettierPath;

  await packageJson.save();

  p.note("Konfiguracja Prettiera została dodana.");
};
