import * as p from "@clack/prompts";
import { loadPackageJSON } from "local-pkg";
import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";

import { getProjectType } from "../utils/get-project-type";
import { gitRoot } from "../utils/git-root";
import { adonisCi } from "./templates/adonis-ci";
import { dependabot } from "./templates/dependabot";
import { nextCi } from "./templates/next-ci";

export const installGithubActions = async () => {
  const root = gitRoot();

  const ghWorkflowsDir = path.join(root, ".github/workflows");
  await fs.mkdir(ghWorkflowsDir, { recursive: true });

  const type = getProjectType();

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
      }),
    );
  }

  if (type === "next") {
    await fs.writeFile(
      path.join(ghWorkflowsDir, "ci.yml"),
      nextCi({
        nodeVersion: "22",
      }),
    );
  }

  if (!existsSync(path.join(root, ".github/dependabot.yml"))) {
    await fs.writeFile(path.join(root, ".github/dependabot.yml"), dependabot());
  }

  const packageJson = await loadPackageJSON(root);

  if (!packageJson) {
    p.cancel(
      "Nie znaleziono package.json. Upewnij się, że jesteś w katalogu projektu.",
    );
    process.exit(1);
  }

  packageJson.scripts = packageJson.scripts ?? {};

  if (!packageJson.scripts["format:check"]) {
    packageJson.scripts["format:check"] = "prettier --check .";
  }

  if (!packageJson.scripts.lint) {
    packageJson.scripts.lint = "eslint .";
  }

  if (!packageJson.scripts.format) {
    packageJson.scripts.format = "prettier --write .";
  }

  if (!packageJson.scripts.typecheck) {
    packageJson.scripts.typecheck = "tsc --noEmit";
  }

  await fs.writeFile(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  p.note("Dodano konfigurację CI i skrypty.");
};
