import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { TestEnvironment } from "./utils/test-environment";

describe("Next.js Integration Tests", () => {
  let env: TestEnvironment;

  beforeAll(async () => {
    env = new TestEnvironment("nextjs-integration");
    await env.setup();
  });

  afterAll(() => {
    env?.cleanup();
  });

  describe("Fresh Next.js App Setup", () => {
    it("should create a Next.js app and install @solvro/config", async () => {
      const appPath = await env.createNextjsApp("test-app", {
        typescript: true,
        tailwind: true,
        eslint: true,
      });

      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Verify the app was created
      expect(env.fileExists(appPath, "package.json")).toBe(true);
      expect(env.fileExists(appPath, "next.config.ts")).toBe(true);

      // Verify @solvro/config is installed
      const packageJson = env.readFile(appPath, "package.json");
      expect(packageJson).toContain("@solvro/config");
    });

    it("should install all tools with --all flag", async () => {
      const appPath = await env.createNextjsApp("all-tools-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      const output = await env.runSolvroConfig(appPath, ["--all", "--force"]);
      expect(output).toContain("Configuration completed successfully");

      // Verify ESLint config
      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);

      // Verify Prettier config
      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);
    });

    it("should install individual tools", async () => {
      const appPath = await env.createNextjsApp("individual-tools-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Test ESLint only
      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);
      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);

      // Test Prettier only
      await env.runSolvroConfig(appPath, ["--prettier", "--force"]);
      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);

      // Test Commitlint
      await env.runSolvroConfig(appPath, ["--commitlint", "--force"]);
      // Commitlint setup should complete without errors
    });
  });

  describe("Code Quality Tools", () => {
    it("should run ESLint successfully after configuration", async () => {
      const appPath = await env.createNextjsApp("eslint-test-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--eslint", "--prettier", "--force"]);

      // Format code first
      const prettierResult = await env.runPrettier(appPath, true);
      expect(prettierResult.success).toBe(true);

      // Then run ESLint
      const eslintResult = await env.runESLint(appPath, 0);
      expect(eslintResult.success).toBe(true);
    });

    it("should format code correctly with Prettier", async () => {
      const appPath = await env.createNextjsApp("prettier-test-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--prettier", "--force"]);

      // Format the code
      const formatResult = await env.runPrettier(appPath, true);
      expect(formatResult.success).toBe(true);

      // Check that code is properly formatted
      const checkResult = await env.runPrettier(appPath, false);
      expect(checkResult.success).toBe(true);
    });

    it("should build Next.js app successfully after configuration", async () => {
      const appPath = await env.createNextjsApp("build-test-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--all", "--force"]);

      // Format and lint the code
      await env.runPrettier(appPath, true);
      const eslintResult = await env.runESLint(appPath, 0);
      expect(eslintResult.success).toBe(true);

      // Build the app
      const buildResult = await env.buildNextjsApp(appPath);
      expect(buildResult.success).toBe(true);
      expect(buildResult.output).toContain("Compiled successfully");
    });
  });

  describe("Configuration Files", () => {
    it("should create proper ESLint configuration", async () => {
      const appPath = await env.createNextjsApp("eslint-config-test");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);

      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);

      const eslintConfig = env.readFile(appPath, "eslint.config.js");
      expect(eslintConfig).toContain("@solvro/config/eslint");
      expect(eslintConfig).toContain("solvro()");
    });

    it("should add Prettier configuration to package.json", async () => {
      const appPath = await env.createNextjsApp("prettier-config-test");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--prettier", "--force"]);

      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);

      const packageJson = env.readFile(appPath, "package.json");
      expect(packageJson).toContain('"prettier": "@solvro/config/prettier"');
    });
  });
});

describe.skip("NestJS Integration Tests", () => {
  let env: TestEnvironment;

  beforeAll(async () => {
    env = new TestEnvironment("nestjs-integration");
    await env.setup();
  });

  afterAll(() => {
    env?.cleanup();
  });

  describe("Fresh NestJS App Setup", () => {
    it("should create a NestJS app and install @solvro/config", async () => {
      const appPath = await env.createNestjsApp("test-app");

      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Verify the app was created
      expect(env.fileExists(appPath, "package.json")).toBe(true);
      expect(env.fileExists(appPath, "tsconfig.json")).toBe(true);

      // Verify @solvro/config is installed
      const packageJson = env.readFile(appPath, "package.json");
      expect(packageJson).toContain("@solvro/config");
    });

    it("should install all tools with --all flag", async () => {
      const appPath = await env.createNestjsApp("all-tools-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      const output = await env.runSolvroConfig(appPath, ["--all", "--force"]);
      expect(output).toContain("Configuration completed successfully");

      // Verify ESLint config
      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);

      // Verify Prettier config
      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);
    });

    it("should install individual tools", async () => {
      const appPath = await env.createNestjsApp("individual-tools-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      // Test ESLint only
      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);
      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);

      // Test Prettier only
      await env.runSolvroConfig(appPath, ["--prettier", "--force"]);
      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);

      // Test Commitlint
      await env.runSolvroConfig(appPath, ["--commitlint", "--force"]);
      // Commitlint setup should complete without errors
    });
  });

  describe("Code Quality Tools", () => {
    it("should run ESLint successfully after configuration", async () => {
      const appPath = await env.createNestjsApp("eslint-test-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--eslint", "--prettier", "--force"]);

      // Format code first
      const prettierResult = await env.runPrettier(appPath, true);
      expect(prettierResult.success).toBe(true);

      // Then run ESLint
      const eslintResult = await env.runESLint(appPath, 0);
      expect(eslintResult.success).toBe(true);
    });

    it("should format code correctly with Prettier", async () => {
      const appPath = await env.createNestjsApp("prettier-test-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--prettier", "--force"]);

      // Format the code
      const formatResult = await env.runPrettier(appPath, true);
      expect(formatResult.success).toBe(true);

      // Check that code is properly formatted
      const checkResult = await env.runPrettier(appPath, false);
      expect(checkResult.success).toBe(true);
    });

    it("should build NestJS app successfully after configuration", async () => {
      const appPath = await env.createNestjsApp("build-test-app");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--all", "--force"]);

      // Format and lint the code
      await env.runPrettier(appPath, true);
      const eslintResult = await env.runESLint(appPath, 0);
      expect(eslintResult.success).toBe(true);

      // Build the app
      const buildResult = await env.buildNestjsApp(appPath);
      expect(buildResult.success).toBe(true);
      expect(env.fileExists(appPath, "dist/main.js")).toBe(true);
    });
  });

  describe("Configuration Files", () => {
    it("should create proper ESLint configuration", async () => {
      const appPath = await env.createNestjsApp("eslint-config-test");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--eslint", "--force"]);

      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);

      const eslintConfig = env.readFile(appPath, "eslint.config.js");
      expect(eslintConfig).toContain("@solvro/config/eslint");
      expect(eslintConfig).toContain("solvro()");
    });

    it("should add Prettier configuration to package.json", async () => {
      const appPath = await env.createNestjsApp("prettier-config-test");
      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      await env.runSolvroConfig(appPath, ["--prettier", "--force"]);

      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);

      const packageJson = env.readFile(appPath, "package.json");
      expect(packageJson).toContain('"prettier": "@solvro/config/prettier"');
    });
  });
});
