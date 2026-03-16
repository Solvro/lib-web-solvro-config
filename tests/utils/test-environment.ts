import { assertExhaustive } from "@solvro/utils/misc";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import type { PackageManagerConfig } from "../../src/constants";
import { PACKAGE_MANAGER_CONFIGS } from "../../src/constants";
import { execSimple } from "./exec-simple";
import { execWithLogging } from "./exec-with-logging";

const DEFAULT_PACKAGE_MANAGER = PACKAGE_MANAGER_CONFIGS.npm;

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

interface SimpleProjectOptions {
  hasLockfile?: boolean;
  withPackageManagerField?: boolean;
}

export class TestEnvironment {
  public readonly testDir: string;
  public readonly projectRoot: string;
  public readonly packageFile: string;

  constructor(
    testName: string,
    public readonly packageManager: PackageManagerConfig = DEFAULT_PACKAGE_MANAGER,
  ) {
    const fullTestName = `solvro-config-test-${testName}-${packageManager.name}-${Date.now()}`;
    this.testDir = path.join("/tmp", fullTestName);
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

  async createSimpleProject(
    projectName: string,
    options: SimpleProjectOptions = {},
  ): Promise<string> {
    const { hasLockfile = true, withPackageManagerField = false } = options;

    const projectPath = path.join(this.testDir, projectName);
    mkdirSync(projectPath, { recursive: true });

    // Create basic package.json
    const packageJson: any = {
      name: projectName,
      version: "1.0.0",
      type: "module",
      scripts: {
        build: "echo 'build complete'",
        lint: "echo 'lint complete'",
        "format:check": "echo 'format check complete'",
        "types:check": "echo 'types check complete'",
      },
    };

    if (withPackageManagerField) {
      packageJson.packageManager = `${this.packageManager.name}@${this.packageManager.name === "npm" ? "10.0.0" : "9.0.0"}`;
    }

    writeFileSync(
      path.join(projectPath, "package.json"),
      JSON.stringify(packageJson, null, 2),
    );

    // Create lockfile if requested
    if (hasLockfile) {
      const lockfilePath = path.join(projectPath, this.packageManager.lockfile);

      switch (this.packageManager.name) {
        case "npm":
          writeFileSync(
            lockfilePath,
            JSON.stringify({ lockfileVersion: 3 }, null, 2),
          );
          break;
        case "pnpm":
          writeFileSync(lockfilePath, "lockfileVersion: '6.0'\n");
          break;
        default:
          assertExhaustive(this.packageManager.name);
      }
    }

    return projectPath;
  }

  async setup(): Promise<void> {
    console.debug("🏗️  Setting up test environment...");

    if (!existsSync(this.packageFile)) {
      throw new Error(
        `Package file not found at ${this.packageFile}. Make sure global setup completed successfully.`,
      );
    }

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

    const appPath = path.join(this.testDir, appName);

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

    const templateDir = path.join(
      this.testDir,
      `create-next-app-${this.packageManager.name}-${flags
        .join("_")
        .replaceAll(/[^a-z0-9-]/gi, "_")
        .replaceAll("--", "")}`,
    );

    // pnpm uses symlinks for dependencies which will not work when copying node_modules
    const shouldRecreateNodeModules = this.packageManager.name === "pnpm";

    if (existsSync(templateDir)) {
      console.debug(`🎯 Using cached template: ${templateDir}`);
    } else {
      console.debug(
        `🏗️  Creating new template with ${this.packageManager.name}: ${templateDir}`,
      );

      // only npm uses '--' for separating argument lists
      const createArguments = this.packageManager.name === "npm" ? ["--"] : [];

      await execWithLogging(
        this.packageManager.name,
        [
          "create",
          `next-app@${nextVersion}`,
          templateDir,
          ...createArguments,
          ...flags,
        ],
        {
          cwd: this.testDir,
          timeout: 120_000, // 2 minutes timeout for app creation
        },
        `create-next-app-${this.packageManager.name}`,
      );
      if (shouldRecreateNodeModules) {
        rmSync(path.join(templateDir, "node_modules"), {
          recursive: true,
          force: true,
        });
      }
    }
    cpSync(templateDir, appPath, { recursive: true });

    if (shouldRecreateNodeModules) {
      const [command, ...commandArguments] =
        this.packageManager.installDependencies.split(" ");
      await execWithLogging(
        command,
        commandArguments,
        { cwd: appPath, timeout: 120_000 },
        "recreate-node-modules",
      );
    }

    return appPath;
  }

  async createNestjsApp(appName: string): Promise<string> {
    const appPath = path.join(this.testDir, appName);
    const templatePath = path.join(this.projectRoot, "tests", "nest-app");

    if (!existsSync(templatePath)) {
      throw new Error(
        `NestJS template not found at ${templatePath}. Make sure the template exists.`,
      );
    }

    console.debug(
      `🎯 Using NestJS template with ${this.packageManager.name}: ${templatePath}`,
    );

    cpSync(templatePath, appPath, {
      recursive: true,
      filter: (source) => !source.includes("node_modules"),
    });

    const [installCommand, ...installArguments] =
      this.packageManager.installDependencies.split(" ");
    await execWithLogging(
      installCommand,
      installArguments,
      {
        cwd: appPath,
        timeout: 120_000, // 2 minutes for dependency installation
      },
      `${this.packageManager.name}-install-deps`,
    );

    return appPath;
  }

  async createViteApp(appName: string, template = "react-ts"): Promise<string> {
    const appPath = path.join(this.testDir, appName);

    // only npm uses '--' for separating argument lists
    const createArguments = this.packageManager.name === "npm" ? ["--"] : [];

    await execWithLogging(
      this.packageManager.name,
      ["create", "vite@9", appName, ...createArguments, "--template", template],
      {
        cwd: this.testDir,
        timeout: 120_000, // 2 minutes for project creation
      },
      `create-vite-${this.packageManager.name}`,
    );

    const [command, ...baseArguments] =
      this.packageManager.installDependencies.split(" ");
    await execWithLogging(
      command,
      baseArguments,
      {
        cwd: appPath,
        timeout: 120_000, // 2 minutes for dependency installation
      },
      `${this.packageManager.name}-install-deps`,
    );

    return appPath;
  }

  async installSolvroConfig(appPath: string): Promise<void> {
    await execWithLogging(
      "cp",
      [this.packageFile, "."],
      { cwd: appPath },
      "copy-package",
    );

    const packageName = this.packageFile.split("/").pop()!;
    const [command, ...baseArguments] =
      this.packageManager.installPackage.split(" ");
    await execWithLogging(
      command,
      [...baseArguments, `./${packageName}`],
      { cwd: appPath },
      `install-solvro-config-${this.packageManager.name}`,
    );
  }

  async initGitRepo(appPath: string): Promise<void> {
    await execWithLogging("git", ["init"], { cwd: appPath }, "git-init");

    try {
      await execSimple("git", ["config", "user.email"], { cwd: appPath });
    } catch {
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

  /** Runs the local `@solvro/config` binary with the appropriate package manager. */
  async runSolvroConfig(
    appPath: string,
    flags: string[] = ["--all", "--force"],
  ): Promise<string> {
    const [command, ...baseArguments] =
      this.packageManager.localExecute.split(" ");
    const { stdout, stderr } = await execWithLogging(
      command,
      [...baseArguments, "config", ...flags],
      { cwd: appPath },
      `solvro-config-${this.packageManager.name}`,
    );
    return stdout + stderr;
  }

  /**
   * Runs the local `@solvro/config` binary directly using Node.
   * Only works with default Commander options, i.e. `--version` and `--help`,
   * as the main executable verifies the user agent is supported.
   */
  async runSolvroConfigDirect(
    flags: string[] = ["--help"],
  ): Promise<{ success: boolean; output: string }> {
    try {
      const cliPath = path.join(this.projectRoot, "dist/cli/index.js");
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
    arguments_: string[] = [],
  ): Promise<{ success: boolean; output: string }> {
    try {
      const [command, ...baseArguments] =
        this.packageManager.runScript.split(" ");
      const { stdout, stderr } = await execWithLogging(
        command,
        [...baseArguments, "lint", ...arguments_],
        { cwd: appPath },
        `eslint-${this.packageManager.name}`,
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
      const [command, ...baseArguments] =
        this.packageManager.localExecute.split(" ");
      const { stdout, stderr } = await execWithLogging(
        command,
        [...baseArguments, "prettier", flag, "."],
        { cwd: appPath },
        `prettier-${this.packageManager.name}`,
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
    const [command, ...baseArguments] =
      this.packageManager.runScript.split(" ");
    try {
      const { stdout, stderr } = await execWithLogging(
        command,
        [...baseArguments, "build"],
        {
          cwd: appPath,
          timeout: 180_000, // 3 minutes for build
        },
        `nextjs-build-${this.packageManager.name}`,
      );
      return { success: true, output: stdout + stderr };
    } catch (error: any) {
      return {
        success: false,
        output: (error.stdout || "") + (error.stderr || ""),
      };
    }
  }

  async buildNestjsApp(
    appPath: string,
  ): Promise<{ success: boolean; output: string }> {
    try {
      const [command, ...baseArguments] =
        this.packageManager.runScript.split(" ");
      const { stdout, stderr } = await execWithLogging(
        command,
        [...baseArguments, "build"],
        {
          cwd: appPath,
          timeout: 180_000, // 3 minutes for build
        },
        `nestjs-build-${this.packageManager.name}`,
      );
      return { success: true, output: stdout + stderr };
    } catch (error: any) {
      return {
        success: false,
        output: (error.stdout || "") + (error.stderr || ""),
      };
    }
  }

  async buildViteApp(
    appPath: string,
  ): Promise<{ success: boolean; output: string }> {
    try {
      const [command, ...baseArguments] =
        this.packageManager.runScript.split(" ");
      const { stdout, stderr } = await execWithLogging(
        command,
        [...baseArguments, "build"],
        {
          cwd: appPath,
          timeout: 180_000, // 3 minutes for build
        },
        `vite-build-${this.packageManager.name}`,
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
    return existsSync(path.join(appPath, filePath));
  }

  readFile(appPath: string, filePath: string): string {
    return readFileSync(path.join(appPath, filePath), "utf8");
  }

  hasPackageJsonField(appPath: string, field: string): boolean {
    const packageJson = JSON.parse(this.readFile(appPath, "package.json"));
    return field in packageJson;
  }

  async installPackage(
    appPath: string,
    packageName: string,
    isDevelopment = false,
  ): Promise<void> {
    const [command, ...baseArguments] =
      this.packageManager.installPackage.split(" ");
    const arguments_ = [...baseArguments];

    if (isDevelopment) {
      arguments_.push("-D");
    }

    arguments_.push(packageName);

    await execWithLogging(
      command,
      arguments_,
      { cwd: appPath },
      `${this.packageManager.name}-install-package`,
    );
  }

  writeFile(appPath: string, filePath: string, content: string): void {
    const fullPath = path.join(appPath, filePath);

    const dir = path.dirname(fullPath);
    mkdirSync(dir, { recursive: true });

    writeFileSync(fullPath, content, "utf8");
  }

  async localExecute(
    appPath: string,
    ...commandArguments: string[]
  ): Promise<void> {
    const [command, ...baseArguments] =
      this.packageManager.localExecute.split(" ");
    await execWithLogging(
      command,
      [...baseArguments, ...commandArguments],
      { cwd: appPath },
      `${this.packageManager.name}-exec`,
    );
  }

  cleanup(): void {
    if (existsSync(this.testDir)) {
      rmSync(this.testDir, { recursive: true, force: true });
    }
  }
}
