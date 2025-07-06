import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 300_000, // 5 minutes for integration tests
    hookTimeout: 60_000, // 1 minute for setup/teardown
    pool: "threads",
    silent: "passed-only",
    globalSetup: ["./tests/global-setup.ts"],
  },
});
