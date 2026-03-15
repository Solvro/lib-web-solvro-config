import { describe, expect, it, test } from "vitest";

import { adonisCi } from "../src/cli/templates/adonis-ci";
import { commitLintCi } from "../src/cli/templates/commit-lint-ci";
import { nestjsCi } from "../src/cli/templates/nestjs-ci";
import { nextJsCi } from "../src/cli/templates/nextjs-ci";
import { nodeSetupCi } from "../src/cli/templates/node-setup-ci";
import { pnpmSetupCi } from "../src/cli/templates/pnpm-setup-ci";
import { reactCi } from "../src/cli/templates/react-ci";
import {
  PACKAGE_MANAGER_CONFIGS,
  SUPPORTED_PACKAGE_MANAGERS,
} from "../src/constants";
import { isSupportedPackageManager } from "../src/utils/is-supported-package-manager";
import { getCurrentPackageManager } from "./utils/package-manager";

describe("CI Template Generation Tests", () => {
  describe("Node Setup CI Template", () => {
    test("should generate correct setup", () => {
      const manager = getCurrentPackageManager();
      const result = nodeSetupCi({ nodeVersion: "22", manager });

      expect(result).toContain("uses: actions/checkout@v6");
      expect(result).toContain("uses: actions/setup-node@v6");
      expect(result).toContain("node-version: 22");
      expect(result).toContain(`cache: "${manager.name}"`);

      if (manager.name === "pnpm") {
        expect(result).toContain("Setup pnpm");
        expect(result).toContain("uses: pnpm/action-setup@v4");
        expect(result).toContain("version: 10");
      } else {
        expect(result).not.toContain("Setup pnpm");
      }
    });

    test.each([["18"], ["20"], ["22"]])(
      "should handle node version %s",
      (nodeVersion) => {
        const manager = PACKAGE_MANAGER_CONFIGS.npm;
        const result = nodeSetupCi({ nodeVersion, manager });
        expect(result).toContain(`node-version: ${nodeVersion}`);
      },
    );
  });

  describe("PNPM Setup CI Template", () => {
    it("should generate pnpm setup with default version", () => {
      const result = pnpmSetupCi();
      expect(result).toContain("Setup pnpm");
      expect(result).toContain("uses: pnpm/action-setup@v4");
      expect(result).toContain("version: 10");
    });

    test.each([["9"], ["10"], ["11"]])(
      "should generate pnpm setup with version %s",
      (pnpmVersion) => {
        const result = pnpmSetupCi({ pnpmVersion });
        expect(result).toContain("Setup pnpm");
        expect(result).toContain("uses: pnpm/action-setup");
        expect(result).toContain(`version: ${pnpmVersion}`);
      },
    );
  });

  describe("React CI Template", () => {
    test("should generate correct CI", () => {
      const manager = getCurrentPackageManager();
      const result = reactCi({
        nodeVersion: "22",
        withCommitlint: false,
        manager,
        usingNextJs: false,
      });

      expect(result).toContain("name: CI");
      expect(result).toContain("runs-on: ubuntu-latest");
      expect(result).toContain(manager.cleanInstall);
      expect(result).toContain(`${manager.runScript} format:check`);
      expect(result).toContain(`${manager.runScript} lint`);
      expect(result).toContain(`${manager.runScript} types:check`);
      expect(result).toContain(`${manager.runScript} build`);

      if (manager.name === "pnpm") {
        expect(result).toContain("Setup pnpm");
        // Check that npm commands are not used (but "pnpm" contains "npm" as substring, so we check for specific npm patterns)
        expect(result).not.toMatch(/\bnpm\s+(ci|install|run)\b/);
      } else {
        expect(result).not.toContain("pnpm");
      }
    });

    test("should include commitlint when requested", () => {
      const manager = getCurrentPackageManager();
      const result = reactCi({
        nodeVersion: "22",
        withCommitlint: true,
        manager,
        usingNextJs: false,
      });

      expect(result).toContain("Check commit name");
      expect(result).toContain(`${manager.localExecute} commitlint`);
    });

    test("should include Next.js caching when using Next.js", () => {
      const manager = getCurrentPackageManager();
      const result = reactCi({
        nodeVersion: "22",
        withCommitlint: false,
        manager,
        usingNextJs: true,
      });

      expect(result).toContain("Setup build cache");
      expect(result).toContain(manager.lockfile);
    });
  });

  describe("NestJS CI Template", () => {
    test("should generate correct CI", () => {
      const manager = getCurrentPackageManager();
      const result = nestjsCi({
        nodeVersion: "22",
        withCommitlint: false,
        manager,
      });

      expect(result).toContain("name: CI");
      expect(result).toContain(manager.cleanInstall);
      expect(result).toContain(`${manager.runScript} format:check`);
      expect(result).toContain(`${manager.runScript} lint`);
      expect(result).toContain(`${manager.runScript} types:check`);
      expect(result).toContain(`${manager.name} test`);
      expect(result).toContain(`${manager.runScript} test:e2e`);
      expect(result).toContain(`${manager.runScript} build`);
    });

    test("should include commitlint when requested", () => {
      const manager = getCurrentPackageManager();
      const result = nestjsCi({
        nodeVersion: "22",
        withCommitlint: true,
        manager,
      });

      expect(result).toContain("Check commit name");
      expect(result).toContain(`${manager.localExecute} commitlint`);
    });
  });

  describe("Adonis CI Templates", () => {
    test("should generate correct Adonis CI", () => {
      const manager = getCurrentPackageManager();
      const result = adonisCi({
        nodeVersion: "22",
        withCommitlint: false,
        manager,
      });

      expect(result).toContain("name: CI");
      expect(result).toContain(manager.cleanInstall);
      expect(result).toContain(`${manager.runScript} format:check`);
      expect(result).toContain(`${manager.runScript} lint`);
      expect(result).toContain(`${manager.runScript} types:check`);
      expect(result).toContain(`${manager.name} test`);
      expect(result).toContain(`${manager.runScript} build`);
      expect(result).toContain("Set up AdonisJS environment");
    });
  });

  describe("CommitLint CI Template", () => {
    test("should generate commitlint check", () => {
      const manager = getCurrentPackageManager();
      const result = commitLintCi({ manager });

      expect(result).toContain("Check commit name");
      expect(result).toContain(`${manager.localExecute} commitlint`);
      expect(result).toContain("github.event.pull_request.base.sha");
      expect(result).toContain("github.event.pull_request.head.sha");
    });
  });

  describe("Next.js CI Template", () => {
    test.each(SUPPORTED_PACKAGE_MANAGERS.filter(isSupportedPackageManager))(
      "should generate correct build cache for %s (%s)",
      (packageManager) => {
        const manager = PACKAGE_MANAGER_CONFIGS[packageManager];
        const result = nextJsCi({ manager });

        expect(result).toContain("Setup build cache");
        expect(result).toContain("uses: actions/cache@v5");
        expect(result).toContain(manager.lockfile);

        // Should not contain other package manager's lockfile
        const otherLockfiles = Object.values(PACKAGE_MANAGER_CONFIGS)
          .filter((c) => c.name !== manager.name)
          .map((c) => c.lockfile);
        for (const otherLockfile of otherLockfiles) {
          expect(result).not.toContain(otherLockfile);
        }
      },
    );
  });

  describe("Package Manager Command Consistency", () => {
    test("should use consistent commands across templates", () => {
      const manager = getCurrentPackageManager();
      const templates = [
        () =>
          reactCi({
            nodeVersion: "22",
            withCommitlint: false,
            manager,
            usingNextJs: false,
          }),
        () =>
          nestjsCi({
            nodeVersion: "22",
            withCommitlint: false,
            manager,
          }),
        () =>
          adonisCi({
            nodeVersion: "22",
            withCommitlint: false,
            manager,
          }),
      ];

      for (const templateFunction of templates) {
        const result = templateFunction();
        expect(result).toContain(manager.cleanInstall);
        expect(result).toContain(manager.runScript);

        if (manager.name === "pnpm") {
          expect(result).not.toContain("npm ci");
          expect(result).not.toContain("npx");
        } else {
          expect(result).not.toContain("pnpm install --frozen-lockfile");
          expect(result).not.toContain("pnpm exec");
        }
      }
    });

    test("should use different commands for different package managers", () => {
      const npmConfig = PACKAGE_MANAGER_CONFIGS.npm;
      const pnpmConfig = PACKAGE_MANAGER_CONFIGS.pnpm;

      const npmTemplate = reactCi({
        nodeVersion: "22",
        withCommitlint: false,
        manager: npmConfig,
        usingNextJs: false,
      });

      const pnpmTemplate = reactCi({
        nodeVersion: "22",
        withCommitlint: false,
        manager: pnpmConfig,
        usingNextJs: false,
      });

      expect(npmTemplate).toContain("npm ci");
      expect(npmTemplate).toContain("npm run");
      expect(npmTemplate).not.toContain("pnpm");

      expect(pnpmTemplate).toContain("pnpm install --frozen-lockfile");
      expect(pnpmTemplate).toContain("pnpm run");
      expect(pnpmTemplate).toContain("Setup pnpm");
      expect(pnpmTemplate).not.toContain("npm ci");
    });
  });

  describe("Template Structure Validation", () => {
    test("should generate valid YAML structure", () => {
      const manager = getCurrentPackageManager();
      const result = reactCi({
        nodeVersion: "22",
        withCommitlint: false,
        manager,
        usingNextJs: false,
      });

      // Basic YAML structure checks
      expect(result).toMatch(/^name: CI/m);
      expect(result).toContain("on:");
      expect(result).toContain("jobs:");
      expect(result).toContain("lint:");
      expect(result).toContain("runs-on: ubuntu-latest");
      expect(result).toContain("steps:");
    });

    test("should include required workflow triggers", () => {
      const manager = getCurrentPackageManager();
      const result = adonisCi({
        nodeVersion: "22",
        withCommitlint: false,
        manager,
      });

      expect(result).toContain("pull_request:");
      expect(result).toContain("push:");
    });

    test("should include proper step ordering", () => {
      const manager = getCurrentPackageManager();
      const result = nestjsCi({
        nodeVersion: "22",
        withCommitlint: true,
        manager,
      });

      const steps = result.split("- name:");
      const stepNames = steps
        .slice(1)
        .map((step) => step.split("\n")[0].trim());

      // Should start with checkout and setup
      expect(stepNames[0]).toContain("Checkout");
      expect(stepNames[1]).toContain("Setup");

      // Should end with build
      expect(stepNames.at(-1)).toContain("Build");
    });
  });
});
