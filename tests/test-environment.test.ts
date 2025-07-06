import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { TestEnvironment } from "./utils/test-environment";

describe("Test Environment Verification", () => {
  let testEnv: TestEnvironment;

  beforeAll(async () => {
    testEnv = new TestEnvironment("verification");
    await testEnv.setup();
  });

  afterAll(() => {
    testEnv?.cleanup();
  });

  it("should have built CLI available", () => {
    expect(testEnv.fileExists(testEnv.projectRoot, "dist/cli/index.js")).toBe(
      true,
    );
  });

  it("should be able to run CLI help command", async () => {
    const result = await testEnv.runSolvroConfigDirect(["--help"]);
    expect(result.success).toBe(true);
    expect(result.output).toContain("Solvro's engineering style guide setup");
  });

  it("should be able to run CLI version command", async () => {
    const result = await testEnv.runSolvroConfigDirect(["--version"]);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/^\d+\.\d+\.\d+/);
  });
});
