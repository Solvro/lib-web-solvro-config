import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 300_000, // 5 minutes for integration tests
    hookTimeout: 60_000, // 1 minute for setup/teardown
    sequence: {
      concurrent: false, // Run tests sequentially to avoid conflicts
    },
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true, // Prevent conflicts with temp directories
      },
    },
  },
});
