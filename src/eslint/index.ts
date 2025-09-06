import { findUpSync } from "find-up-simple";
import { isPackageListed } from "local-pkg";
import path from "node:path";
import tseslint from "typescript-eslint";
import type { ConfigWithExtends } from "typescript-eslint";

import { basePreset, defaultOverridesPreset } from "./presets/base";

export const solvro = async (...overrides: ConfigWithExtends[]) => {
  const isAdonis = await isPackageListed("@adonisjs/core");
  const isReact = await isPackageListed("react");
  const isNestJs = await isPackageListed("@nestjs/core");

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

  const defaultOverrides = defaultOverridesPreset();

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  return tseslint.config(
    ...configs,
    tsConfig,
    ...projectConfigs,
    ...defaultOverrides,
    ...overrides,
  );
};
