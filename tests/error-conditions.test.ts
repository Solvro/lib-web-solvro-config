import { exec } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { TestEnvironment } from "./utils/test-environment";

const execAsync = promisify(exec);

describe("Error Conditions and Edge Cases", () => {
  let env: TestEnvironment;

  beforeAll(async () => {
    env = new TestEnvironment("error-conditions");
    await env.setup();
  });

  afterAll(() => {
    env?.cleanup();
  });

  describe("Git Repository Checks", () => {
    it("should fail without git repository when --force is not used", async () => {
      const appPath = await env.createNextjsApp("no-git-app");
      await env.installSolvroConfig(appPath);

      // Don't initialize git repo
      try {
        await env.runSolvroConfig(appPath, ["--eslint"]); // No --force flag
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message || error.stdout || error.stderr).toContain(
          "uncommitted changes",
        );
      }
    });

    it("should work with --force flag even without git", async () => {
      const appPath = await env.createNextjsApp("force-no-git-app");
      await env.installSolvroConfig(appPath);

      // Should work with --force
      const output = await env.runSolvroConfig(appPath, [
        "--eslint",
        "--force",
      ]);
      expect(output).toContain("Configuration completed successfully");
      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);
    });
  });

  describe("CLI Flag Validation", () => {
    it("should fail when no tools are specified", async () => {
      const appPath = await env.createNextjsApp("no-tools-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      try {
        await env.runSolvroConfig(appPath, ["--force"]); // Only --force, no tools
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message || error.stdout || error.stderr).toContain(
          "No tools specified",
        );
      }
    });

    it("should show help when --help is used", async () => {
      const appPath = await env.createNextjsApp("help-test-app");
      await env.installSolvroConfig(appPath);

      const { stdout } = await execAsync("npx @solvro/config --help", {
        cwd: appPath,
      });
      expect(stdout).toContain("Solvro's engineering style guide setup");
      expect(stdout).toContain("--eslint");
      expect(stdout).toContain("--prettier");
      expect(stdout).toContain("--all");
    });

    it("should show version when --version is used", async () => {
      const appPath = await env.createNextjsApp("version-test-app");
      await env.installSolvroConfig(appPath);

      const { stdout } = await execAsync("npx @solvro/config --version", {
        cwd: appPath,
      });
      expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/); // Should be a version number
    });
  });

  describe("Edge Case Configurations", () => {
    it("should work with minimal Next.js setup", async () => {
      const appPath = await env.createNextjsApp("minimal-app", {
        typescript: true,
        tailwind: false,
        eslint: true,
        srcDir: false,
      });

      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--eslint", "--prettier", "--force"]);

      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);
      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);

      // Should still be able to build
      const buildResult = await env.buildNextjsApp(appPath);
      expect(buildResult.success).toBe(true);
    });

    it("should handle already configured projects", async () => {
      const appPath = await env.createNextjsApp("reconfigure-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Configure once
      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);
      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);

      // Configure again - should not fail
      const output = await env.runSolvroConfig(appPath, [
        "--eslint",
        "--prettier",
        "--force",
      ]);
      expect(output).toContain("Configuration completed successfully");

      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);
      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);
    });
  });

  describe("Project Type Detection", () => {
    it("should detect Next.js project correctly", async () => {
      const appPath = await env.createNextjsApp("detection-test-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // The CLI should detect this as a React/Next.js project
      const output = await env.runSolvroConfig(appPath, [
        "--eslint",
        "--force",
      ]);

      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);

      // Check that the ESLint config includes React rules
      const eslintConfig = env.readFile(appPath, "eslint.config.js");
      expect(eslintConfig).toContain("solvro()");

      // Should be able to lint React/Next.js code without errors
      await env.runPrettier(appPath, true); // Format first
      const eslintResult = await env.runESLint(appPath, 0);
      expect(eslintResult.success).toBe(true);
    });
  });
});
