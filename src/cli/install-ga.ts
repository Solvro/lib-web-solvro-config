import * as p from "@clack/prompts";
import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";

import { gitRoot } from "../utils/git-root";
import { PackageJson } from "../utils/package-json";
import { adonisCi } from "./templates/adonis-ci";
import { dependabot } from "./templates/dependabot";
import { nextCi } from "./templates/next-ci";

const packageJson = new PackageJson();

export const installGithubActions = async () => {
  const root = gitRoot();
  await packageJson.load();

  const ghWorkflowsDir = path.join(root, ".github/workflows");
  await fs.mkdir(ghWorkflowsDir, { recursive: true });

  const type = await packageJson.getProjectType();

  const withCommitlint = await packageJson.hasPackage("@commitlint/cli");

  if (type === "adonis") {
    if (!existsSync(path.join(root, ".env.example"))) {
      p.cancel(
        "Nie znaleziono pliku .env.example. Upewnij się, że jesteś w katalogu projektu Adonisa.",
      );
      process.exit(1);
    }

    await fs.writeFile(
      path.join(ghWorkflowsDir, "ci.yml"),
      adonisCi({
        nodeVersion: "22",
        withCommitlint,
      }),
    );
  }

  if (type === "next") {
    await fs.writeFile(
      path.join(ghWorkflowsDir, "ci.yml"),
      nextCi({
        nodeVersion: "22",
        withCommitlint,
      }),
    );
  }

  if (!existsSync(path.join(root, ".github/dependabot.yml"))) {
    await fs.writeFile(path.join(root, ".github/dependabot.yml"), dependabot());
  }

  await packageJson.addScriptIfNotExists("format:check", "prettier --check .");
  await packageJson.addScriptIfNotExists("lint", "eslint . --max-warnings=0");
  await packageJson.addScriptIfNotExists("format", "prettier --write .");
  await packageJson.addScriptIfNotExists("typecheck", "tsc --noEmit");

  p.note("Dodano konfigurację CI i skrypty.");
};
