import * as p from "@clack/prompts";
import c from "picocolors";

import { isGitClean } from "../utils/is-git-clean";
import { PackageJson } from "../utils/package-json";
import { polishConfirm } from "../utils/polish-confirm";
import { installCommitLint } from "./install-commitlint";
import { installEslint } from "./install-eslint";
import { installGithubActions } from "./install-ga";
import { installLintStaged } from "./install-lint-staged";
import { installPrettier } from "./install-prettier";

p.intro(c.bold(c.bgBlue("  @solvro/config  ")));

if (!isGitClean()) {
  const isConfirmed = await polishConfirm({
    message: `Masz niezapisane zmiany w Git. Czy chcesz kontynuować?`,
  });

  if (p.isCancel(isConfirmed) || !isConfirmed) {
    p.cancel("Zapisz zmiany w Git i spróbuj ponownie.");
    process.exit(1);
  }
}

const packageJson = new PackageJson();

await packageJson.ensureESM();

const projectType = await packageJson.getProjectType();

if (projectType === "adonis") {
  const isConfirmed = await polishConfirm({
    message: `Wygląda jakbyś używał Adonisa. Czy to się zgadza?`,
  });

  if (p.isCancel(isConfirmed) || !isConfirmed) {
    p.cancel("Zgłoś błąd na GitHubie :(, a my spróbujemy pomóc.");
    process.exit(1);
  }
}

if (projectType === "next") {
  const isConfirmed = await polishConfirm({
    message: `Wygląda jakbyś używał Next.js. Czy to się zgadza?`,
  });

  if (p.isCancel(isConfirmed)) {
    p.cancel("😡");
    process.exit(1);
  }

  if (!isConfirmed) {
    p.cancel("Zgłoś błąd na GitHubie :(, a my spróbujemy pomóc.");
    process.exit(1);
  }
}

if (projectType === "node") {
  p.cancel(
    "Nie znaleziono ani Adonisa, ani Next.js. Musisz ręcznie konfigurować projekt.",
  );
  process.exit(1);
}

const additionalTools = await p.multiselect({
  message: `Które rzeczy Cię interesują? ${c.gray("zaznacz spacją, potwierdź enterem")}`,
  initialValues: ["eslint", "prettier", "gh-action", "commitlint"],
  options: [
    {
      value: "eslint",
      label: c.bold(c.blueBright("ESLint")),
      hint: "sprawdzanie jakości kodu",
    },
    {
      value: "prettier",
      label: c.bold(c.yellowBright("Prettier")),
      hint: "formatowanie",
    },
    {
      value: "gh-action",
      label: c.bold("GitHub Actions"),
      hint: "automatyczne testy na Githubie",
    },
    {
      value: "commitlint",
      label: c.bold("Commitlint"),
      hint: "walidacja treści commitów",
    },
  ],
  required: false,
});

if (p.isCancel(additionalTools) || additionalTools.length === 0) {
  p.cancel("Nie wybrano żadnych narzędzi.");
  process.exit(1);
}

await packageJson.install("@solvro/config", { dev: true });

if (additionalTools.includes("eslint")) {
  await installEslint();
}

if (additionalTools.includes("prettier")) {
  await installPrettier();

  await installLintStaged();
}

if (additionalTools.includes("commitlint")) {
  await installCommitLint();
}

if (additionalTools.includes("gh-action")) {
  await installGithubActions();
}
