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
      const appPath = await env.createNextjsApp("test-app");

      await env.installSolvroConfig(appPath);
      await env.initGitRepo(appPath);

      const output = await env.runSolvroConfig(appPath, ["--all", "--force"]);
      expect(output).toContain("Configuration completed successfully");

      // Format code first
      const prettierResult = await env.runPrettier(appPath, true);
      expect(prettierResult.success).toBe(true);

      // Then run ESLint
      const eslintResult = await env.runESLint(appPath);
      expect(eslintResult.success).toBe(true);

      // Verify ESLint config
      expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);

      // Verify Prettier config
      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);

      // Verify the app was created
      expect(env.fileExists(appPath, "package.json")).toBe(true);
      expect(env.fileExists(appPath, "next.config.ts")).toBe(true);

      // Verify @solvro/config is installed
      const packageJson = env.readFile(appPath, "package.json");
      expect(packageJson).toContain("@solvro/config");

      const buildResult = await env.buildNextjsApp(appPath);
      expect(buildResult.success).toBe(true);
      expect(buildResult.output).toContain("Compiled successfully");

      const eslintConfig = env.readFile(appPath, "eslint.config.js");
      expect(eslintConfig).toContain("@solvro/config/eslint");
      expect(eslintConfig).toContain("solvro()");

      expect(packageJson).toContain('"prettier": "@solvro/config/prettier"');
    });
  });
});

describe("NestJS Integration Tests", () => {
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

      const output = await env.runSolvroConfig(appPath, ["--all", "--force"]);
      expect(output).toContain("Configuration completed successfully");

      // Format code first
      const prettierResult = await env.runPrettier(appPath, true);
      expect(prettierResult.success).toBe(true);

      // Then run ESLint
      const eslintResult = await env.runESLint(appPath);
      expect(eslintResult.success).toBe(true);

      // Verify ESLint config
      expect(env.fileExists(appPath, "eslint.config.mjs")).toBe(true);

      // Verify Prettier config
      expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);

      // Verify the app was created
      expect(env.fileExists(appPath, "package.json")).toBe(true);
      expect(env.fileExists(appPath, "tsconfig.json")).toBe(true);

      // Verify @solvro/config is installed
      const packageJson = env.readFile(appPath, "package.json");
      expect(packageJson).toContain("@solvro/config");

      // Build the app
      const buildResult = await env.buildNestjsApp(appPath);
      expect(buildResult.success).toBe(true);
      expect(env.fileExists(appPath, "dist/main.js")).toBe(true);

      const eslintConfig = env.readFile(appPath, "eslint.config.mjs");
      expect(eslintConfig).toContain("@solvro/config/eslint");
      expect(eslintConfig).toContain("solvro()");

      expect(packageJson).toContain('"prettier": "@solvro/config/prettier"');
    });
  });
});
