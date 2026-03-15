import { execa } from "execa";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Helper function to run commands with real-time output logging
async function execWithLogging(
  command: string,
  arguments_: string[] = [],
  options: any = {},
  label?: string,
): Promise<{ stdout: string; stderr: string }> {
  const displayLabel = label || command;
  console.debug(
    `🔧 [${displayLabel}] Running: ${command} ${arguments_.join(" ")}`,
  );

  try {
    const subprocess = execa(command, arguments_, {
      stdio: ["inherit", "pipe", "pipe"],
      ...options,
    });

    // Stream stdout in real-time
    subprocess.stdout?.on("data", (data) => {
      console.debug(`📤 [${displayLabel}] ${data.toString().trim()}`);
    });

    // Stream stderr in real-time
    subprocess.stderr?.on("data", (data) => {
      console.debug(`⚠️  [${displayLabel}] ${data.toString().trim()}`);
    });

    const result = await subprocess;
    console.debug(`✅ [${displayLabel}] Command completed successfully`);

    return {
      stdout: result.stdout || "",
      stderr: result.stderr || "",
    };
  } catch (error: any) {
    console.debug(`❌ [${displayLabel}] Command failed with error:`);
    throw error;
  }
}

export async function setup() {
  console.debug("🌍 Running global test setup...");

  const projectRoot = process.cwd();

  // Build and pack the project
  await execWithLogging("npm", ["run", "build"], { cwd: projectRoot }, "build");

  // Verify the CLI was built
  const cliPath = join(projectRoot, "dist/cli/index.js");
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
  );

  // Extract package filename from npm pack output
  const lines = stdout.trim().split("\n");
  const packageFile = lines.at(-1)!;
  const packagePath = join(projectRoot, packageFile);

  // Store the package file path in a global variable or environment variable
  // so individual tests can access it
  process.env.SOLVRO_TEST_PACKAGE_FILE = packagePath;

  console.debug(`📦 Package built and available at: ${packagePath}`);
  console.debug("✅ Global test setup completed");
}

export async function teardown() {
  console.debug("🧹 Running global test teardown...");

  const projectRoot = process.cwd();

  // Clean up package files in project root
  try {
    await execa("rm", ["-f", "solvro-config-*.tgz"], {
      cwd: projectRoot,
    });
    console.debug("📦 Cleaned up package files");
  } catch {
    // Ignore cleanup errors
    console.debug("⚠️  Package cleanup failed (non-critical)");
  }

  // Clean up global test cache directory
  try {
    await execa("rm", ["-rf", "/tmp/solvro-test-cache"], {});
    console.debug("🗂️  Cleaned up global test cache");
  } catch {
    // Ignore cleanup errors
    console.debug("⚠️  Global cache cleanup failed (non-critical)");
  }

  console.debug("✅ Global test teardown completed");
}
