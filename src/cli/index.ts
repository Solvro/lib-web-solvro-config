import * as p from "@clack/prompts";
import { Command } from "commander";
import c from "picocolors";

import { BUG_TRACKER_URL } from "../constants";
import { confirmProjectType } from "../utils/confirm-project-type";
import { getPackageVersion } from "../utils/get-package-info";
import { hasUserConfirmed } from "../utils/has-user-confirmed";
import { isGitClean } from "../utils/is-git-clean";
import { isNonInteractive } from "../utils/is-non-interactive";
import { PackageJson } from "../utils/package-json";
import { printIntro } from "../utils/print-intro";
import { printOutro } from "../utils/print-outro";
import { getSolvroConfigInstallTag } from "./get-solvro-config-install-tag";
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
const { version, versionParseError } = getPackageVersion();
const program = new Command();
program
  .name("@solvro/config")
  .description("Solvro's engineering style guide setup")
  .version(version ?? "")
  .option("-f, --force", "Skip git clean check", false)
  .option("--eslint", "Install ESLint configuration", false)
  .option("--prettier", "Install Prettier configuration", false)
  .option("--gh-action", "Install GitHub Actions", false)
  .option("--commitlint", "Install Commitlint configuration", false)
  .option("-a, --all", "Install all tools", false);

program.parse();
const options: CliOptions = program.opts();

const REQUIRED_ESM_PROJECT_TYPES = new Set<
  Awaited<ReturnType<PackageJson["getProjectType"]>>
>(["adonis", "react"]);

async function main() {
  printIntro(version ?? "");
  if (versionParseError != null) {
    p.log.warning(versionParseError);
  }

  const packageJson = new PackageJson();
  packageJson.verifyPackageManager();
  await packageJson.load(); // Project directory check
  await packageJson.validateUserAgentConsistency();

  // Git clean check
  if (options.force !== true && !isGitClean()) {
    if (isNonInteractive) {
      p.log.error("Repozytorium Git ma niezatwierdzone zmiany.");
      p.cancel("Użyj --force, aby pominąć to sprawdzenie.");
      process.exit(1);
    }

    const isConfirmed = await hasUserConfirmed({
      message: `Masz niezapisane zmiany w Git. Czy chcesz kontynuować?`,
    });

    if (!isConfirmed) {
      p.cancel("Zapisz zmiany w Git i spróbuj ponownie.");
      process.exit(1);
    }
  }

  // Peer dependencies check
  if (
    (await packageJson.hasPackage("eslint")) &&
    !(await packageJson.doesSatisfy("eslint", "^10"))
  ) {
    const eslint = await packageJson.getPackageInfo("eslint");
    const versionInfo =
      eslint?.version == null
        ? ""
        : ` Obecnie zainstalowana jest wersja ${c.yellow(eslint.version)}.`;
    const errorMessage = `ESLint w wersji innej niż 10 nie jest wspierany.${versionInfo}`;
    const errorRetry = "Proszę zainstalować wersję 10 i spróbować ponownie.";
    if (isNonInteractive) {
      p.log.error(errorMessage);
      p.cancel(errorRetry);
      process.exit(1);
    }
    const isConfirmed = await hasUserConfirmed({
      message: `${errorMessage} Zainstalować wspieraną wersję ${c.magenta("ESLint")}'a? (Wymagane by kontynuować)`,
    });
    if (!isConfirmed) {
      p.cancel(errorRetry);
      process.exit(1);
    }
    await packageJson.install("eslint", { dev: true, version: "^10" });
  }

  // Determine project type automatically
  const projectType = await packageJson.getProjectType();

  // Project type confirmation (interactive mode only)
  if (!isNonInteractive) {
    switch (projectType) {
      case "adonis": {
        await confirmProjectType(c.magenta("Adonis"));
        break;
      }
      case "react": {
        await confirmProjectType(c.cyan("React"));
        break;
      }
      case "nestjs": {
        await confirmProjectType(c.red("NestJS"));
        break;
      }
      case "node": {
        p.cancel(
          `Nie znaleziono ani ${c.magenta("Adonis")}-a, ${c.cyan("React")}-a, ani ${c.white("NestJS")}-a. Musisz ręcznie konfigurować projekt.`,
        );
        process.exit(1);
      }
    }
  }
  if (REQUIRED_ESM_PROJECT_TYPES.has(projectType)) {
    const shouldSkipEsmConfirmation =
      isNonInteractive || (await packageJson.isEsm());
    if (!shouldSkipEsmConfirmation) {
      const isConfirmed = await hasUserConfirmed({
        message: `Twój projekt nie używa ESM (brak ${c.yellow('"type": "module"')} w package.json). Czy chcesz to dodać? (Wymagane by kontynuować)`,
      });

      if (!isConfirmed) {
        p.cancel("Zmień projekt na ESM i spróbuj ponownie.");
        process.exit(1);
      }
    }
    await packageJson.ensureEsm();
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
      p.log.error("Nie wybrano żadnych narzędzi.");
      p.cancel(
        "Użyj --eslint, --prettier, --gh-action, --commitlint, lub --all",
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
          hint: "automatyczne testy na GitHubie",
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
    version: getSolvroConfigInstallTag(version ?? ""),
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
  if (toolsToInstall.includes("prettier")) {
    await packageJson.localExecute("prettier", "--write", "package.json");
  }

  printOutro();
}

async function mainWrapper() {
  try {
    await main();
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      p.cancel("Unhandled error in main:");
      console.error(error instanceof Error ? error.message : error);
    } else {
      p.log.error("Wystąpił nieoczekiwany błąd :(");
      p.cancel(`Proszę zgłosić go twórcom: ${BUG_TRACKER_URL}`);
    }
    process.exit(1);
  }
}

void mainWrapper();
