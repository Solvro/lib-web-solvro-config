import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 300_000, // 5 minutes for integration tests
    hookTimeout: 180_000, // 3 minutes for setup/teardown
    pool: "threads",
    silent: "passed-only",
    globalSetup: ["./tests/global-setup.ts"],
    include: ["./**/*.test.ts"],
  },
});
