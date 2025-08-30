import * as p from "@clack/prompts";
import { Command } from "commander";
import { getUserAgent } from "package-manager-detector/detect";
import c from "picocolors";

import packageJsonData from "../../package.json";
import { isGitClean } from "../utils/is-git-clean";
import { PackageJson } from "../utils/package-json";
import { polishConfirm } from "../utils/polish-confirm";
import { installCommitLint } from "./install-commitlint";
import { installEslint } from "./install-eslint";
import { installGithubActions } from "./install-ga";
import { installLintStaged } from "./install-lint-staged";
import { installPrettier } from "./install-prettier";

// Types
interface CliOptions {
  force?: boolean;
  eslint?: boolean;
  prettier?: boolean;
  ghAction?: boolean;
  commitlint?: boolean;
  all?: boolean;
}

// CLI setup
const program = new Command();
program
  .name("@solvro/config")
  .description("Solvro's engineering style guide setup")
  .version(packageJsonData.version)
  .option("-f, --force", "Skip git clean check", false)
  .option("--eslint", "Install ESLint configuration", false)
  .option("--prettier", "Install Prettier configuration", false)
  .option("--gh-action", "Install GitHub Actions", false)
  .option("--commitlint", "Install Commitlint configuration", false)
  .option("-a, --all", "Install all tools", false);

program.parse();
const options: CliOptions = program.opts();

// Check if running in non-interactive mode (any CLI flags provided)
const isNonInteractive = process.argv.length > 2;

async function main() {
  if (!isNonInteractive) {
    p.intro(c.bold(c.bgBlue("  @solvro/config  ")));
  }

  const userAgent = getUserAgent();

  if (userAgent !== "npm") {
    const packageManager = userAgent ?? "unknown";
    const warningMessage = `
${c.red(c.bold(`⚠️  OSTRZEŻENIE: ${packageManager} nie jest obsługiwany ⚠️`))}

Próbujesz uruchomić ten skrypt z ${c.yellow(packageManager)}'em, ale @solvro/config działa tylko z ${c.yellow("npm'em")}. 

Support dla innych menedżerów pakietów nie jest planowany - chcemy jednolitego stacku technologicznego dla projektów w naszym kochanym kole Solvro.

Użyj zamiast tego npm'a:
${c.cyan("npx @solvro/config")}`;

    if (isNonInteractive) {
      console.error(warningMessage);
    } else {
      p.cancel(warningMessage);
    }
    process.exit(1);
  }

  // Git clean check
  if (options.force !== true && !isGitClean()) {
    if (isNonInteractive) {
      console.error(
        "Repozytorium Git ma niezatwierdzone zmiany. Użyj --force, aby pominąć to sprawdzenie.",
      );
      process.exit(1);
    }

    const isConfirmed = await polishConfirm({
      message: `Masz niezapisane zmiany w Git. Czy chcesz kontynuować?`,
    });

    if (p.isCancel(isConfirmed) || !isConfirmed) {
      p.cancel("Zapisz zmiany w Git i spróbuj ponownie.");
      process.exit(1);
    }
  }

  const packageJson = new PackageJson();

  // Determine project type automatically
  const projectType = await packageJson.getProjectType();

  // Project type confirmation (interactive mode only)
  if (!isNonInteractive) {
    if (projectType === "adonis") {
      const isConfirmed = await polishConfirm({
        message: `Wygląda jakbyś używał Adonisa. Czy to się zgadza?`,
      });

      if (p.isCancel(isConfirmed) || !isConfirmed) {
        p.cancel("Zgłoś błąd na GitHubie :(, a my spróbujemy pomóc.");
        process.exit(1);
      }
    }

    if (projectType === "react") {
      const isConfirmed = await polishConfirm({
        message: `Wygląda jakbyś używał Reacta. Czy to się zgadza?`,
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

    if (projectType === "nestjs") {
      const isConfirmed = await polishConfirm({
        message: `Wygląda jakbyś używał NestJsa. Czy to się zgadza?`,
      });

      if (p.isCancel(isConfirmed)) {
        p.cancel("😡");
        process.exit(1);
      }
    }

    if (projectType === "node") {
      p.cancel(
        "Nie znaleziono ani Adonisa, Reacta, ani NestJsa. Musisz ręcznie konfigurować projekt.",
      );
      process.exit(1);
    }
  }
  if (projectType === "adonis" || projectType === "react") {
    if (isNonInteractive) {
      await packageJson.ensureESM();
    } else {
      if (!(await packageJson.isESM())) {
        const isConfirmed = await polishConfirm({
          message: `Twój projekt nie używa ESM (brak type: "module" w package.json). Czy chcesz to dodać? (Wymagane by kontynuować)`,
        });

        if (p.isCancel(isConfirmed) || !isConfirmed) {
          p.cancel("Zmień projekt na ESM i spróbuj ponownie.");
          process.exit(1);
        }

        await packageJson.ensureESM();
      }
    }
  }

  // Determine which tools to install
  let toolsToInstall: string[] = [];

  if (options.all === true) {
    toolsToInstall = ["eslint", "prettier", "gh-action", "commitlint"];
  } else if (isNonInteractive) {
    // In non-interactive mode, only install explicitly requested tools
    if (options.eslint === true) {
      toolsToInstall.push("eslint");
    }
    if (options.prettier === true) {
      toolsToInstall.push("prettier");
    }
    if (options.ghAction === true) {
      toolsToInstall.push("gh-action");
    }
    if (options.commitlint === true) {
      toolsToInstall.push("commitlint");
    }

    if (toolsToInstall.length === 0) {
      console.error(
        "Nie wybrano żadnych narzędzi. Użyj --eslint, --prettier, --gh-action, --commitlint, lub --all",
      );
      process.exit(1);
    }
  } else {
    // Interactive mode
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

    toolsToInstall = additionalTools;
  }

  // Install the base package
  await packageJson.install("@solvro/config", {
    dev: true,
    alwaysUpdate: !isNonInteractive,
  });

  // Install selected tools
  if (toolsToInstall.includes("eslint")) {
    await installEslint(isNonInteractive);
  }

  if (toolsToInstall.includes("prettier")) {
    await installPrettier(isNonInteractive);
    await installLintStaged();
  }

  if (toolsToInstall.includes("commitlint")) {
    await installCommitLint();
  }

  if (toolsToInstall.includes("gh-action")) {
    await installGithubActions();
  }

  await packageJson.clearInstall();

  if (isNonInteractive) {
    console.log("✅ Konfiguracja zakończona pomyślnie!");
  } else {
    p.outro("✅ Konfiguracja zakończona pomyślnie!");
  }
}

// Run the main function
try {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  void main();
} catch (error: unknown) {
  console.error("Wystąpił błąd:", error);
  process.exit(1);
}
