import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { TestEnvironment } from "./utils/test-environment";

describe("Cross-Version Compatibility Tests", () => {
  let env: TestEnvironment;

  beforeAll(async () => {
    env = new TestEnvironment("cross-version");
    await env.setup();
  });

  afterAll(() => {
    env?.cleanup();
  });

  describe("Next.js Version Compatibility", () => {
    it("should work with Next.js latest", async () => {
      const appPath = await env.createNextjsApp("nextjs-latest", {
        nextVersion: "latest",
      });

      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--all", "--force"]);

      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);
      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);

      // Format and build
      await env.runPrettier(appPath, true);
      const buildResult = await env.buildNextjsApp(appPath);
      expect(buildResult.success, buildResult.output).toBe(true);
    });

    // Note: Testing canary might be flaky in CI, so we'll make it optional
    it.skip("should work with Next.js canary", async () => {
      const appPath = await env.createNextjsApp("nextjs-canary", {
        nextVersion: "canary",
      });

      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--all", "--force"]);

      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);
      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);
    });
  });

  describe("Configuration Variations", () => {
    it("should work with TypeScript + Tailwind + App Router", async () => {
      const appPath = await env.createNextjsApp("full-featured", {
        typescript: true,
        tailwind: true,
        eslint: true,
        appDir: true,
        srcDir: true,
      });

      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--all", "--force"]);

      // Verify all tools work together
      await env.runPrettier(appPath, true);
      const eslintResult = await env.runESLint(appPath, 0);
      expect(eslintResult.success).toBe(true);

      const buildResult = await env.buildNextjsApp(appPath);
      expect(buildResult.success).toBe(true);
    });

    it("should work with minimal configuration", async () => {
      const appPath = await env.createNextjsApp("minimal-featured", {
        typescript: true,
        tailwind: false,
        eslint: true,
        appDir: true,
        srcDir: false,
      });

      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--eslint", "--prettier", "--force"]);

      // Should work with minimal setup
      await env.runPrettier(appPath, true);
      const eslintResult = await env.runESLint(appPath, 0);
      expect(eslintResult.success).toBe(true);

      const buildResult = await env.buildNextjsApp(appPath);
      expect(buildResult.success).toBe(true);
    });
  });

  describe("Performance Tests", () => {
    it("should complete configuration in reasonable time", async () => {
      const startTime = Date.now();

      const appPath = await env.createNextjsApp("performance-test");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--all", "--force"]);

      const configTime = Date.now() - startTime;

      // Configuration should complete within 30 seconds
      expect(configTime).toBeLessThan(30_000);

      // Verify everything works
      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);
      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);
    });
  });
});
