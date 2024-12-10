import * as p from "@clack/prompts";
import { $ } from "execa";
import { isPackageListed } from "local-pkg";
import c from "picocolors";

import { getProjectType } from "../utils/get-project-type";
import { gitRoot } from "../utils/git-root";
import { isGitClean } from "../utils/is-git-clean";
import { polishConfirm } from "../utils/polish-confirm";
import { installEslint } from "./install-eslint";
import { installGithubActions } from "./install-ga";
import { installLintStaged } from "./install-lint-staged";
import { installPrettier } from "./install-prettier";

p.intro(`${c.bold(c.bgBlue("  @solvro/config  "))}`);

const projectType = getProjectType();

if (!isGitClean()) {
  const isConfirmed = await polishConfirm({
    message: `Masz niezapisane zmiany w Git. Czy chcesz kontynuować?`,
  });

  if (!isConfirmed || p.isCancel(isConfirmed)) {
    p.cancel("Zapisz zmiany w Git i spróbuj ponownie.");
    process.exit(1);
  }
}

if (projectType === "adonis") {
  const isConfirmed = await polishConfirm({
    message: `Wygląda jakbyś używał Adonisa. Czy to się zgadza?`,
  });

  if (!isConfirmed || p.isCancel(isConfirmed)) {
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
  initialValues: ["eslint", "prettier", "gh-action"],
  options: [
    {
      value: "eslint",
      label: `${c.bold(c.blueBright("ESLint"))}`,
      hint: "sprawdzanie jakości kodu",
    },
    {
      value: "prettier",
      label: `${c.bold(c.yellowBright("Prettier"))}`,
      hint: "formatowanie",
    },
    {
      value: "gh-action",
      label: `${c.bold("GitHub Actions")}`,
      hint: "automatyczne testy na Githubie",
    },
  ],
  required: false,
});

const $$ = $({
  cwd: gitRoot(),
  stdout: ["pipe", "inherit"],
});

if (p.isCancel(additionalTools)) {
  p.cancel("Nie wybrano żadnych narzędzi.");
  process.exit(1);
}

await p.tasks([
  {
    title: "Instalowanie @solvro/config",
    enabled: !(await isPackageListed("@solvro/config")),
    task: async () => {
      await $$`npm i -D @solvro/config`;
    },
  },
]);

if (additionalTools.includes("eslint")) {
  await installEslint();
}

if (additionalTools.includes("prettier")) {
  await installPrettier();

  await installLintStaged();
}

if (additionalTools.includes("gh-action")) {
  await installGithubActions();
}
