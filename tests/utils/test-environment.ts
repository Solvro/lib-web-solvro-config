import { assertExhaustive } from "@solvro/utils/misc";
import assert from "node:assert";
import {
  copyFileSync,
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

  async execute({
    command,
    args = [],
    label,
    ...executionOptions
  }: {
    command: keyof PackageManagerConfig;
    args?: string[];
    label: string;
    cwd?: string;
    timeout?: number;
  }): ReturnType<typeof execWithLogging> {
    const [baseCommand, ...commandOptions] =
      this.packageManager[command].split(" ");
    return await execWithLogging(
      baseCommand,
      [...commandOptions, ...args],
      { cwd: this.testDir, timeout: 120_000, ...executionOptions },
      label,
    );
  }

  async installPackage(
    appPath: string,
    packageName: string,
    isDevelopment = false,
  ): Promise<void> {
    const flags = isDevelopment ? ["-D"] : [];
    await this.execute({
      command: "installPackage",
      args: [...flags, packageName],
      cwd: appPath,
      label: `install-package-${path.basename(packageName)}`,
    });
  }

  /**
   * Creates a project from the specified template, generating it if necessary.
   * @returns the path to the newly-created project
   */
  async create({
    appName,
    templatePath,
    creator,
    flags = [],
    ensureInstall = false,
  }: {
    appName: string;
    ensureInstall?: boolean;
  } & (
    | { templatePath?: never; creator: string; flags: string[] }
    | { templatePath: string; creator?: never; flags?: never }
  )): Promise<string> {
    const appPath = path.join(this.testDir, appName);
    const isLocalTemplate = templatePath != null;
    // pnpm uses symlinks for dependencies which will not work when copying node_modules
    const shouldRecreateNodeModules =
      ensureInstall || isLocalTemplate || this.packageManager.name === "pnpm";
    const templateDir =
      templatePath ??
      path.join(
        this.testDir,
        `${this.packageManager.name}-create-${creator}-${flags.join(".")}`
          .replaceAll(/[^a-z0-9.-]/gi, "_")
          .replaceAll("--", ""),
      );
    const templateExists = existsSync(templateDir);

    if (isLocalTemplate && !templateExists) {
      throw new Error(
        `Local template not found at ${templatePath}. Make sure the template exists.`,
      );
    }
    if (templateExists) {
      const templateDescription = isLocalTemplate ? "local" : "cached";
      console.debug(`🎯 Using ${templateDescription} template: ${templateDir}`);
    } else {
      assert(!isLocalTemplate);
      console.debug(
        `🏗️  Creating new template with ${this.packageManager.name}: ${templateDir}`,
      );
      // only npm uses '--' for separating argument lists
      const createArguments = this.packageManager.name === "npm" ? ["--"] : [];
      await this.execute({
        command: "create",
        args: [
          creator,
          path.basename(templateDir),
          ...createArguments,
          ...flags,
        ],
        label: `create-${creator}`,
      });
    }
    cpSync(templateDir, appPath, {
      recursive: true,
      filter: shouldRecreateNodeModules
        ? (source) => !source.includes("node_modules")
        : undefined,
    });
    if (shouldRecreateNodeModules) {
      await this.execute({
        command: "installDependencies",
        cwd: appPath,
        label: "install-deps",
      });
    }
    return appPath;
  }

  async createSimpleProject(
    projectName: string,
    {
      hasLockfile = true,
      withPackageManagerField = false,
    }: {
      hasLockfile?: boolean;
      withPackageManagerField?: boolean;
    } = {},
  ): Promise<string> {
    const projectPath = path.join(this.testDir, projectName);
    mkdirSync(projectPath, { recursive: true });

    const packageJson: Record<string, string | Record<string, string>> = {
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
      const packageManagerVersion =
        this.packageManager.name === "npm" ? "11.0.0" : "10.0.0";
      packageJson.packageManager = `${this.packageManager.name}@${packageManagerVersion}`;
    }

    writeFileSync(
      path.join(projectPath, "package.json"),
      JSON.stringify(packageJson, null, 2),
    );

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
    options: {
      name?: string;
      typescript?: boolean;
      tailwind?: boolean;
      eslint?: boolean;
      appDir?: boolean;
      srcDir?: boolean;
      importAlias?: string;
      nextVersion?: string;
    } = {},
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
    return await this.create({
      appName,
      creator: `next-app@${nextVersion}`,
      flags,
    });
  }

  async createNestjsApp(appName: string): Promise<string> {
    const templatePath = path.join(this.projectRoot, "tests", "nest-app");
    return await this.create({ appName, templatePath });
  }

  async createViteApp(appName: string, template = "react-ts"): Promise<string> {
    return await this.create({
      appName,
      creator: "vite@9",
      flags: ["--no-interactive", "--template", template],
      ensureInstall: true,
    });
  }

  async installSolvroConfig(appPath: string): Promise<void> {
    const packageName = this.packageFile.split("/").at(-1)!;
    copyFileSync(this.packageFile, path.join(appPath, packageName));
    await this.installPackage(appPath, `./${packageName}`, true);
  }

  async initGitRepo(appPath: string): Promise<void> {
    await execWithLogging(
      "git",
      ["init", "--initial-branch=main"],
      { cwd: appPath },
      "git-init",
    );

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
    const { stdout, stderr } = await this.execute({
      command: "localExecute",
      args: ["config", ...flags],
      cwd: appPath,
      label: "solvro-config",
    });
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
      const { stdout, stderr } = await this.execute({
        command: "runScript",
        args: ["lint", ...arguments_],
        cwd: appPath,
        label: "eslint",
      });
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
    const flag = write ? "--write" : "--check";
    try {
      const { stdout, stderr } = await this.execute({
        command: "localExecute",
        args: ["prettier", flag, "."],
        cwd: appPath,
        label: "prettier",
      });
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
      const { stdout, stderr } = await this.execute({
        command: "runScript",
        args: ["build"],
        cwd: appPath,
        timeout: 180_000, // 3 minutes for build
        label: "nextjs-build",
      });
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
      const { stdout, stderr } = await this.execute({
        command: "runScript",
        args: ["build"],
        cwd: appPath,
        timeout: 180_000, // 3 minutes for build
        label: "nestjs-build",
      });
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
      const { stdout, stderr } = await this.execute({
        command: "runScript",
        args: ["build"],
        cwd: appPath,
        timeout: 180_000, // 3 minutes for build
        label: "vite-build",
      });
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

  writeFile(appPath: string, filePath: string, content: string): void {
    const fullPath = path.join(appPath, filePath);

    const dir = path.dirname(fullPath);
    mkdirSync(dir, { recursive: true });

    writeFileSync(fullPath, content, "utf8");
  }

  cleanup(): void {
    if (existsSync(this.testDir)) {
      rmSync(this.testDir, { recursive: true, force: true });
    }
  }
}
