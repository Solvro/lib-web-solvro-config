import { execa } from "execa";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import pino from "pino";

// Create logger instance - silent by default, can be enabled with LOG_LEVEL=debug
const logger = pino({
  level: process.env.LOG_LEVEL || "silent",
  transport: process.env.LOG_LEVEL
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          messageFormat: "{msg}",
        },
      }
    : undefined,
});

// Helper function to run commands with real-time output logging
async function execWithLogging(
  command: string,
  args: string[] = [],
  options: any = {},
  label?: string,
): Promise<{ stdout: string; stderr: string }> {
  const displayLabel = label || command;
  logger.debug(`🔧 [${displayLabel}] Running: ${command} ${args.join(" ")}`);

  try {
    const subprocess = execa(command, args, {
      stdio: ["inherit", "pipe", "pipe"],
      ...options,
    });

    // Stream stdout in real-time
    subprocess.stdout?.on("data", (data) => {
      logger.debug(`📤 [${displayLabel}] ${data.toString().trim()}`);
    });

    // Stream stderr in real-time
    subprocess.stderr?.on("data", (data) => {
      logger.debug(`⚠️  [${displayLabel}] ${data.toString().trim()}`);
    });

    const result = await subprocess;
    logger.debug(`✅ [${displayLabel}] Command completed successfully`);

    return {
      stdout: result.stdout || "",
      stderr: result.stderr || "",
    };
  } catch (error: any) {
    logger.debug(`❌ [${displayLabel}] Command failed with error:`);
    throw error;
  }
}

// Simple wrapper for when we just need the result without streaming
async function execSimple(
  command: string,
  args: string[] = [],
  options: any = {},
): Promise<{ stdout: string; stderr: string }> {
  const result = await execa(command, args, options);
  return {
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

export interface TestAppOptions {
  name?: string;
  typescript?: boolean;
  tailwind?: boolean;
  eslint?: boolean;
  appDir?: boolean;
  srcDir?: boolean;
  importAlias?: string;
  nextVersion?: string;
}

export class TestEnvironment {
  public readonly testDir: string;
  public readonly projectRoot: string;
  public readonly packageFile: string;

  constructor(testName: string) {
    this.testDir = join("/tmp", `solvro-test-${testName}-${Date.now()}`);
    this.projectRoot = process.cwd();
    this.packageFile = "";
  }

  async setup(): Promise<void> {
    logger.debug("🏗️  Setting up test environment...");

    // Build and pack the project
    await execWithLogging(
      "npm",
      ["run", "build"],
      { cwd: this.projectRoot },
      "build",
    );

    // Verify the CLI was built
    const cliPath = join(this.projectRoot, "dist/cli/index.js");
    if (!existsSync(cliPath)) {
      throw new Error(
        `Built CLI not found at ${cliPath}. Make sure build completed successfully.`,
      );
    }

    const { stdout } = await execWithLogging(
      "npm",
      ["pack"],
      { cwd: this.projectRoot },
      "pack",
    );

    // Extract package filename from npm pack output
    const lines = stdout.trim().split("\n");
    const packageFile = lines[lines.length - 1];
    (this as any).packageFile = join(this.projectRoot, packageFile);

    // Create test directory
    mkdirSync(this.testDir, { recursive: true });
    logger.debug(`📁 Test directory created: ${this.testDir}`);
  }

  async createNextjsApp(
    appName: string,
    options: TestAppOptions = {},
  ): Promise<string> {
    const {
      typescript = true,
      tailwind = true,
      eslint = true,
      appDir = true,
      srcDir = true,
      importAlias = "@/*",
      nextVersion = "latest",
    } = options;

    const appPath = join(this.testDir, appName);

    const flags = [
      typescript ? "--typescript" : "--no-typescript",
      tailwind ? "--tailwind" : "--no-tailwind",
      eslint ? "--eslint" : "--no-eslint",
      appDir ? "--app" : "--no-app",
      srcDir ? "--src-dir" : "--no-src-dir",
      `--import-alias "${importAlias}"`,
      "--no-git",
      "--yes",
    ];

    await execWithLogging(
      "npx",
      [`create-next-app@${nextVersion}`, appName, ...flags],
      {
        cwd: this.testDir,
        timeout: 120_000, // 2 minutes timeout for app creation
      },
      "create-next-app",
    );

    return appPath;
  }

  async installSolvroConfig(appPath: string): Promise<void> {
    // Copy package to app directory
    await execWithLogging(
      "cp",
      [this.packageFile, "."],
      { cwd: appPath },
      "copy-package",
    );

    // Install the package (needed for config files, but we'll use built CLI)
    const packageName = this.packageFile.split("/").pop()!;
    await execWithLogging(
      "npm",
      ["install", `./${packageName}`],
      { cwd: appPath },
      "npm-install",
    );
  }
  async initGitRepo(appPath: string): Promise<void> {
    await execWithLogging("git", ["init"], { cwd: appPath }, "git-init");

    // Check if git user is configured, if not configure it for this repository
    try {
      await execSimple("git", ["config", "user.email"], { cwd: appPath });
    } catch {
      // No email configured, set it
      await execWithLogging(
        "git",
        ["config", "user.email", "test@example.com"],
        { cwd: appPath },
        "git-config-email",
      );
    }

    try {
      await execSimple("git", ["config", "user.name"], { cwd: appPath });
    } catch {
      // No name configured, set it
      await execWithLogging(
        "git",
        ["config", "user.name", "Test User"],
        { cwd: appPath },
        "git-config-name",
      );
    }

    await execWithLogging("git", ["add", "."], { cwd: appPath }, "git-add");
    await execWithLogging(
      "git",
      ["commit", "-m", "Initial commit"],
      { cwd: appPath },
      "git-commit",
    );
  }

  async runSolvroConfig(
    appPath: string,
    flags: string[] = ["--all", "--force"],
  ): Promise<string> {
    const { stdout, stderr } = await execWithLogging(
      "npx",
      ["@solvro/config", ...flags],
      { cwd: appPath },
      "solvro-config",
    );
    return stdout + stderr;
  }

  async runSolvroConfigDirect(
    flags: string[] = ["--help"],
  ): Promise<{ success: boolean; output: string }> {
    try {
      const cliPath = join(this.projectRoot, "dist/cli/index.js");
      const { stdout, stderr } = await execSimple("node", [cliPath, ...flags], {
        cwd: this.testDir,
      });
      return { success: true, output: stdout + stderr };
    } catch (error: any) {
      return {
        success: false,
        output: (error.stdout || "") + (error.stderr || ""),
      };
    }
  }

  async runESLint(
    appPath: string,
    maxWarnings = 0,
  ): Promise<{ success: boolean; output: string }> {
    try {
      const { stdout, stderr } = await execWithLogging(
        "npx",
        ["eslint", ".", "--max-warnings", maxWarnings.toString()],
        { cwd: appPath },
        "eslint",
      );
      return { success: true, output: stdout + stderr };
    } catch (error: any) {
      return {
        success: false,
        output: (error.stdout || "") + (error.stderr || ""),
      };
    }
  }

  async runPrettier(
    appPath: string,
    write = false,
  ): Promise<{ success: boolean; output: string }> {
    try {
      const flag = write ? "--write" : "--check";
      const { stdout, stderr } = await execWithLogging(
        "npx",
        ["prettier", flag, "."],
        { cwd: appPath },
        "prettier",
      );
      return { success: true, output: stdout + stderr };
    } catch (error: any) {
      return {
        success: false,
        output: (error.stdout || "") + (error.stderr || ""),
      };
    }
  }

  async buildNextjsApp(
    appPath: string,
  ): Promise<{ success: boolean; output: string }> {
    try {
      const { stdout, stderr } = await execWithLogging(
        "npm",
        ["run", "build"],
        {
          cwd: appPath,
          timeout: 180_000, // 3 minutes for build
        },
        "nextjs-build",
      );
      return { success: true, output: stdout + stderr };
    } catch (error: any) {
      return {
        success: false,
        output: (error.stdout || "") + (error.stderr || ""),
      };
    }
  }

  fileExists(appPath: string, filePath: string): boolean {
    return existsSync(join(appPath, filePath));
  }

  readFile(appPath: string, filePath: string): string {
    return readFileSync(join(appPath, filePath), "utf-8");
  }

  hasPackageJsonField(appPath: string, field: string): boolean {
    const packageJson = JSON.parse(this.readFile(appPath, "package.json"));
    return field in packageJson;
  }

  cleanup(): void {
    if (existsSync(this.testDir)) {
      rmSync(this.testDir, { recursive: true, force: true });
    }

    // Clean up package files in project root
    try {
      execSimple("rm", ["-f", "solvro-config-*.tgz"], {
        cwd: this.projectRoot,
      });
    } catch {
      // Ignore cleanup errors
    }
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Operation timed out",
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([promise, timeout]);
}

// Export logger for use in other test files
export { logger };

// Utility function to enable debug logging for tests
export function enableDebugLogging(): void {
  logger.level = "debug";
}
