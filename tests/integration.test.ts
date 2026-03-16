import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { getCurrentPackageManager } from "./utils/package-manager";
import { TestEnvironment } from "./utils/test-environment";

describe("Next.js Integration Tests", () => {
  let testEnv: TestEnvironment;
  const packageManager = getCurrentPackageManager();

  beforeEach(async () => {
    testEnv = new TestEnvironment("nextjs-integration", packageManager);
  });

  afterEach(() => {
    testEnv?.cleanup();
  });

  test(`should create a Next.js app and install @solvro/config with ${packageManager.name}`, async () => {
    const env = testEnv;
    await env.setup();

    const appPath = await env.createNextjsApp("test-app");

    await env.installSolvroConfig(appPath);
    await env.initGitRepo(appPath);

    const output = await env.runSolvroConfig(appPath, ["--all", "--force"]);
    expect(output).toContain("Konfiguracja zakończona pomyślnie");

    const prettierResult = await env.runPrettier(appPath, true);
    expect(prettierResult.success).toBe(true);

    const eslintResult = await env.runESLint(appPath);
    expect(eslintResult.success).toBe(true);

    expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);
    expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);
    expect(env.fileExists(appPath, "package.json")).toBe(true);
    expect(env.fileExists(appPath, "next.config.ts")).toBe(true);

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

describe("NestJS Integration Tests", () => {
  let testEnv: TestEnvironment;
  const packageManager = getCurrentPackageManager();

  beforeEach(async () => {
    testEnv = new TestEnvironment("nestjs-integration", packageManager);
  });

  afterEach(() => {
    testEnv?.cleanup();
  });

  test(`should create a NestJS app and install @solvro/config with ${packageManager.name}`, async () => {
    const env = testEnv;
    await env.setup();

    const appPath = await env.createNestjsApp("test-app");

    await env.installSolvroConfig(appPath);
    await env.initGitRepo(appPath);

    const output = await env.runSolvroConfig(appPath, ["--all", "--force"]);
    expect(output).toContain("Konfiguracja zakończona pomyślnie");

    const prettierResult = await env.runPrettier(appPath, true);
    expect(prettierResult.success).toBe(true);

    const eslintResult = await env.runESLint(appPath);
    expect(eslintResult.success).toBe(true);

    expect(env.fileExists(appPath, "eslint.config.mjs")).toBe(true);
    expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);
    expect(env.fileExists(appPath, "package.json")).toBe(true);
    expect(env.fileExists(appPath, "tsconfig.json")).toBe(true);

    const packageJson = env.readFile(appPath, "package.json");
    expect(packageJson).toContain("@solvro/config");

    const buildResult = await env.buildNestjsApp(appPath);
    expect(buildResult.success).toBe(true);
    expect(env.fileExists(appPath, "dist/main.js")).toBe(true);

    const eslintConfig = env.readFile(appPath, "eslint.config.mjs");
    expect(eslintConfig).toContain("@solvro/config/eslint");
    expect(eslintConfig).toContain("solvro()");

    expect(packageJson).toContain('"prettier": "@solvro/config/prettier"');
  });
});

describe("Vite Integration Tests", () => {
  let testEnv: TestEnvironment;
  const packageManager = getCurrentPackageManager();

  beforeEach(async () => {
    testEnv = new TestEnvironment("vite-integration", packageManager);
  });

  afterEach(() => {
    testEnv?.cleanup();
  });

  test(`should create a Vite React app and install @solvro/config with ${packageManager.name}`, async () => {
    const env = testEnv;
    await env.setup();

    const appPath = await env.createViteApp("test-app-react", "react-ts");

    await env.installSolvroConfig(appPath);
    await env.initGitRepo(appPath);

    const output = await env.runSolvroConfig(appPath, ["--all", "--force"]);
    expect(output).toContain("Konfiguracja zakończona pomyślnie");

    const prettierResult = await env.runPrettier(appPath, true);
    expect(prettierResult.success).toBe(true);

    const eslintResult = await env.runESLint(appPath);
    expect(eslintResult.output).toContain("Filename is not in kebab case");

    expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);
    expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);
    expect(env.fileExists(appPath, "package.json")).toBe(true);
    expect(env.fileExists(appPath, "vite.config.ts")).toBe(true);
    expect(env.fileExists(appPath, "index.html")).toBe(true);
    expect(env.fileExists(appPath, "src/App.tsx")).toBe(true);

    const packageJson = env.readFile(appPath, "package.json");
    expect(packageJson).toContain("@solvro/config");

    const buildResult = await env.buildViteApp(appPath);
    expect(buildResult.success).toBe(true);
    expect(buildResult.output).toContain("built in");

    const eslintConfig = env.readFile(appPath, "eslint.config.js");
    expect(eslintConfig).toContain("@solvro/config/eslint");
    expect(eslintConfig).toContain("solvro()");

    expect(packageJson).toContain('"prettier": "@solvro/config/prettier"');
  });
});
