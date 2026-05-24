import type { Config, ConfigWithExtends } from "@eslint/config-helpers";
import { defineConfig } from "eslint/config";
import { findUpSync } from "find-up-simple";
import { getPackageInfo, isPackageListed } from "local-pkg";
import path from "node:path";
import semver from "semver";

import { basePreset, defaultOverridesPreset } from "./presets/base";

export const solvro = async (
  ...overrides: ConfigWithExtends[]
): Promise<Config[]> => {
  const isAdonis = await isPackageListed("@adonisjs/core");
  const isReact = await isPackageListed("react");
  const isNestJs = await isPackageListed("@nestjs/core");
  const isZod = await isPackageListed("zod");

  if (isReact && isAdonis) {
    throw new Error("You can't use both Adonis and React in the same project");
  }

  const configs = basePreset();
  const projectConfigs: ConfigWithExtends[] = [];

  if (isAdonis) {
    const { adonisPreset } = await import("./presets/adonis.js");
    projectConfigs.push(...adonisPreset());
  } else if (isNestJs) {
    const { nestjsPreset } = await import("./presets/nestjs.js");
    projectConfigs.push(...(await nestjsPreset()));
  } else if (isReact) {
    const { reactPreset } = await import("./presets/react.js");
    projectConfigs.push(...(await reactPreset()));
  } else {
    const { nodePreset } = await import("./presets/node.js");
    projectConfigs.push(...nodePreset());
  }

  const tsConfigPath = findUpSync("tsconfig.json", {
    cwd: process.cwd(),
  });

  if (tsConfigPath == null) {
    throw new Error("No tsconfig.json found");
  }

  const rootDirectory = path.dirname(tsConfigPath);

  const tsConfig: ConfigWithExtends = {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: rootDirectory,
      },
    },
  };

  if (isZod) {
    const zodInfo = await getPackageInfo("zod");
    const zodVersion = zodInfo?.version;
    const isV4 = zodVersion != null && semver.satisfies(zodVersion, ">=4.0.0");

    if (isV4) {
      const { zodV4 } = await import("./configs/zod-v4.js");
      projectConfigs.push(...zodV4());
    } else {
      const { zodV3 } = await import("./configs/zod-v3.js");
      projectConfigs.push(...zodV3());
    }
  }

  const defaultOverrides = defaultOverridesPreset();

  return defineConfig(
    ...configs,
    tsConfig,
    ...projectConfigs,
    ...defaultOverrides,
    ...overrides,
  );
};
