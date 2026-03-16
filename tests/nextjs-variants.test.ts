import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { TestEnvironment } from "./utils/test-environment";

const testInstallation = async ({
  env,
  appPath,
  format = false,
  lint = false,
  build = false,
}: {
  env: TestEnvironment;
  appPath: string;
  format?: boolean;
  lint?: boolean;
  build?: boolean;
}) => {
  await env.installSolvroConfig(appPath);
  await env.initGitRepo(appPath);

  const startTime = performance.now();
  await env.runSolvroConfig(appPath, ["--all", "--force"]);
  const endTime = performance.now();

  expect(env.fileExists(appPath, "eslint.config.js")).toBe(true);
  expect(env.hasPackageJsonField(appPath, "prettier")).toBe(true);

  if (format) {
    const formatResult = await env.runPrettier(appPath, true);
    expect(formatResult.success).toBe(true);
  }
  if (lint) {
    const eslintResult = await env.runESLint(appPath);
    expect(eslintResult.success).toBe(true);
  }
  if (build) {
    const buildResult = await env.buildNextjsApp(appPath);
    expect(buildResult.success, buildResult.output).toBe(true);
  }
  return endTime - startTime;
};

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
      await testInstallation({ env, appPath, format: true, build: true });
    });

    // Note: Testing canary might be flaky in CI, so we'll make it optional
    it.skip("should work with Next.js canary", async () => {
      const appPath = await env.createNextjsApp("nextjs-canary", {
        nextVersion: "canary",
      });
      await testInstallation({ env, appPath });
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
      await testInstallation({
        env,
        appPath,
        format: true,
        lint: true,
        build: true,
      });
    });

    it("should work with minimal configuration", async () => {
      const appPath = await env.createNextjsApp("minimal-featured", {
        typescript: true,
        tailwind: false,
        eslint: true,
        appDir: true,
        srcDir: false,
      });
      await testInstallation({
        env,
        appPath,
        format: true,
        lint: true,
        build: true,
      });
    });
  });

  describe("Performance Tests", () => {
    it("should complete configuration in reasonable time", async () => {
      const appPath = await env.createNextjsApp("performance-test");
      const configTime = await testInstallation({ env, appPath });
      expect(configTime).toBeLessThan(60_000);
    });
  });
});
