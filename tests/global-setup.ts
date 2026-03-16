import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import { execWithLogging } from "./utils/exec-with-logging";

export async function setup() {
  console.debug("🌍 Running global test setup...");

  const projectRoot = process.cwd();

  await execWithLogging(
    "npm",
    ["run", "build"],
    { cwd: projectRoot },
    "build",
    { streamOutput: false },
  );

  const cliPath = path.join(projectRoot, "dist/cli/index.js");
  if (!existsSync(cliPath)) {
    throw new Error(
      `Built CLI not found at ${cliPath}. Make sure build completed successfully.`,
    );
  }

  const { stdout } = await execWithLogging(
    "npm",
    ["pack"],
    { cwd: projectRoot },
    "pack",
    { streamErrors: false },
  );

  const lines = stdout.trim().split("\n");
  const packageFile = lines.at(-1)!;
  const packagePath = path.join(projectRoot, packageFile);

  process.env.SOLVRO_TEST_PACKAGE_FILE = packagePath;

  console.debug(`📦 Package built and available at: ${packagePath}`);
  console.debug("✅ Global test setup completed");
}

export async function teardown() {
  console.debug("🧹 Running global test teardown...");

  if (process.env.SOLVRO_TEST_PACKAGE_FILE != null) {
    try {
      await fs.rm(process.env.SOLVRO_TEST_PACKAGE_FILE);
      console.debug("📦 Cleaned up package files");
    } catch {
      console.debug("⚠️  Package cleanup failed (non-critical)");
    }
  }

  console.debug("✅ Global test teardown completed");
}
