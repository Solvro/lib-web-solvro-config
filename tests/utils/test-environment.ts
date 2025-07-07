import { execa } from "execa";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

// Helper function to run commands with real-time output logging
async function execWithLogging(
  command: string,
  args: string[] = [],
  options: any = {},
  label?: string,
): Promise<{ stdout: string; stderr: string }> {
  const displayLabel = label || command;
  console.debug(`🔧 [${displayLabel}] Running: ${command} ${args.join(" ")}`);

  try {
    const subprocess = execa(command, args, {
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

interface TestAppOptions {
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

    // Get the package file path from the global setup
    const packageFile = process.env.SOLVRO_TEST_PACKAGE_FILE;
    if (!packageFile) {
      throw new Error(
        "Package file not found. Make sure global setup has run successfully.",
      );
    }
    this.packageFile = packageFile;
  }

  async setup(): Promise<void> {
    console.debug("🏗️  Setting up test environment...");

    // Verify the package file exists (built by global setup)
    if (!existsSync(this.packageFile)) {
      throw new Error(
        `Package file not found at ${this.packageFile}. Make sure global setup completed successfully.`,
      );
    }

    // Create test directory
    mkdirSync(this.testDir, { recursive: true });
    console.debug(`📁 Test directory created: ${this.testDir}`);
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

    const templateDir = join(
      this.testDir,
      `create-next-app-${flags.join("-").replace(/[^a-z0-9]/gi, "_")}`,
    );

    if (existsSync(templateDir)) {
      // Template already exists, copy it to the app path
      console.debug(`🎯 Using cached template: ${templateDir}`);
      cpSync(templateDir, appPath, { recursive: true });
    } else {
      // Create new template and cache it
      console.debug(`🏗️  Creating new template: ${templateDir}`);
      await execWithLogging(
        "npx",
        [`create-next-app@${nextVersion}`, templateDir, ...flags],
        {
          cwd: this.testDir,
          timeout: 120_000, // 2 minutes timeout for app creation
        },
        "create-next-app",
      );

      // Copy template to the app path
      cpSync(templateDir, appPath, { recursive: true });
    }

    return appPath;
  } /**
   * Create a NestJS application using the Nest CLI.
   */
  async createNestjsApp(appName: string): Promise<string> {
    const appPath = join(this.testDir, appName);

    // Use a global cache directory that's shared across all test environments
    const globalCacheDir = join("/tmp", "solvro-test-cache");
    const templateDir = join(globalCacheDir, "nestjs-template");

    if (existsSync(templateDir)) {
      // Template already exists, copy it to the app path
      console.debug(`🎯 Using cached NestJS template: ${templateDir}`);
      cpSync(templateDir, appPath, { recursive: true });
    } else {
      // Create new template and cache it
      console.debug(`🏗️  Creating new NestJS template: ${templateDir}`);

      // Ensure cache directory exists
      mkdirSync(globalCacheDir, { recursive: true });

      await execWithLogging(
        "npx",
        ["@nestjs/cli", "new", "nestjs-template", "-p", "npm"],
        {
          cwd: globalCacheDir,
          timeout: 180_000, // 3 minutes for project creation
        },
        "nest-cli",
      );

      // Copy template to the app path
      cpSync(templateDir, appPath, { recursive: true });
    }

    return appPath;
  }

  /**
   * Create a Vite application using create-vite CLI.
   */
  async createViteApp(appName: string, template = "react-ts"): Promise<string> {
    const appPath = join(this.testDir, appName);
    await execWithLogging(
      "npm",
      ["create", "vite@latest", appName, "--", "--template", template],
      {
        cwd: this.testDir,
        timeout: 120_000, // 2 minutes for project creation
      },
      "create-vite",
    );

    // Install dependencies
    await execWithLogging(
      "npm",
      ["install"],
      {
        cwd: appPath,
        timeout: 120_000, // 2 minutes for dependency installation
      },
      "npm-install-deps",
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
  ): Promise<{ success: boolean; output: string }> {
    try {
      const { stdout, stderr } = await execWithLogging(
        "npm",
        ["run", "lint"],
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

  /**
   * Build a NestJS application by running its build script.
   */
  async buildNestjsApp(
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
        "nestjs-build",
      );
      return { success: true, output: stdout + stderr };
    } catch (error: any) {
      return {
        success: false,
        output: (error.stdout || "") + (error.stderr || ""),
      };
    }
  }

  /**
   * Build a Vite application by running its build script.
   */
  async buildViteApp(
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
        "vite-build",
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

  async installPackage(appPath: string, packageName: string): Promise<void> {
    await execWithLogging(
      "npm",
      ["install", packageName],
      { cwd: appPath },
      "npm-install-package",
    );
  }

  writeFile(appPath: string, filePath: string, content: string): void {
    const fullPath = join(appPath, filePath);

    // Ensure directory exists
    const dir = dirname(fullPath);
    mkdirSync(dir, { recursive: true });

    writeFileSync(fullPath, content, "utf-8");
  }

  cleanup(): void {
    if (existsSync(this.testDir)) {
      rmSync(this.testDir, { recursive: true, force: true });
    }
    // Package cleanup is now handled by global teardown
  }
}
