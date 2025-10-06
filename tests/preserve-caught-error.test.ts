import { getPackageInfo } from "local-pkg";
import { describe, expect, it, vi } from "vitest";

// Mock the local-pkg module to simulate different ESLint versions
vi.mock("local-pkg", () => ({
  getPackageInfo: vi.fn(),
}));

describe("Preserve Caught Error Rule Tests", () => {
  const mockGetPackageInfo = vi.mocked(getPackageInfo);

  it("should include preserve-caught-error rule when ESLint >= 9.35.0", async () => {
    // Mock ESLint version 9.35.0
    mockGetPackageInfo.mockResolvedValue({
      name: "eslint",
      version: "9.35.0",
      rootPath: "/mock/path",
      packageJsonPath: "/mock/path/package.json",
    });

    // Import the javascript function after mocking
    const { javascript } = await import("../src/eslint/configs/javascript");
    const configs = await javascript();

    // Find the config with rules
    const rulesConfig = configs.find((config) => config.rules);
    expect(rulesConfig).toBeDefined();
    expect(rulesConfig?.rules).toBeDefined();

    // Check if preserve-caught-error rule is present and set to "error"
    expect(rulesConfig?.rules?.["preserve-caught-error"]).toBe("error");
  });

  it("should include preserve-caught-error rule when ESLint > 9.35.0", async () => {
    // Mock ESLint version 9.36.0 (newer version)
    mockGetPackageInfo.mockResolvedValue({
      name: "eslint",
      version: "9.36.0",
      rootPath: "/mock/path",
      packageJsonPath: "/mock/path/package.json",
    });

    // Import the javascript function after mocking
    const { javascript } = await import("../src/eslint/configs/javascript");
    const configs = await javascript();

    // Find the config with rules
    const rulesConfig = configs.find((config) => config.rules);
    expect(rulesConfig).toBeDefined();
    expect(rulesConfig?.rules).toBeDefined();

    // Check if preserve-caught-error rule is present and set to "error"
    expect(rulesConfig?.rules?.["preserve-caught-error"]).toBe("error");
  });

  it("should NOT include preserve-caught-error rule when ESLint < 9.35.0", async () => {
    // Mock ESLint version 9.34.0 (older version)
    mockGetPackageInfo.mockResolvedValue({
      name: "eslint",
      version: "9.34.0",
      rootPath: "/mock/path",
      packageJsonPath: "/mock/path/package.json",
    });

    // Import the javascript function after mocking
    const { javascript } = await import("../src/eslint/configs/javascript");
    const configs = await javascript();

    // Find the config with rules
    const rulesConfig = configs.find((config) => config.rules);
    expect(rulesConfig).toBeDefined();
    expect(rulesConfig?.rules).toBeDefined();

    // Check if preserve-caught-error rule is NOT present
    expect(rulesConfig?.rules?.["preserve-caught-error"]).toBeUndefined();
  });

  it("should handle missing ESLint package gracefully", async () => {
    // Mock no ESLint package found
    mockGetPackageInfo.mockResolvedValue(undefined);

    // Import the javascript function after mocking
    const { javascript } = await import("../src/eslint/configs/javascript");
    const configs = await javascript();

    // Find the config with rules
    const rulesConfig = configs.find((config) => config.rules);
    expect(rulesConfig).toBeDefined();
    expect(rulesConfig?.rules).toBeDefined();

    // Check if preserve-caught-error rule is NOT present when ESLint is not found
    expect(rulesConfig?.rules?.["preserve-caught-error"]).toBeUndefined();
  });
});
