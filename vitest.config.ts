import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 300_000, // 5 minutes for integration tests
    hookTimeout: 60_000, // 1 minute for setup/teardown
    pool: "threads",
    env: {
      LOG_LEVEL: process.env.CI == null ? "debug" : "silent", // Default to debug unless in CI
    },
  },
});
