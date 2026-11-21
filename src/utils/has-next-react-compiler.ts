import { createJiti } from "jiti";
import { existsSync } from "node:fs";
import path from "node:path";

interface NextConfig {
  reactCompiler?: unknown;
  experimental?: { reactCompiler?: unknown };
}

const CONFIG_EXTENSIONS = ["js", "mjs", "cjs", "ts", "mts", "cts"];

export async function hasNextReactCompiler(
  cwd = process.cwd(),
): Promise<boolean> {
  const file = CONFIG_EXTENSIONS.map((extension) =>
    path.join(cwd, `next.config.${extension}`),
  ).find((candidate) => existsSync(candidate));

  if (file === undefined) {
    return false;
  }

  try {
    const loaded = await createJiti(cwd).import<
      | NextConfig
      | ((...arguments_: unknown[]) => Promise<NextConfig> | NextConfig)
    >(file, { default: true });
    const config =
      typeof loaded === "function"
        ? await loaded("phase-development-server", { defaultConfig: {} })
        : loaded;
    // `experimental.reactCompiler` is the pre-Next 16 location
    return Boolean(config.reactCompiler ?? config.experimental?.reactCompiler);
  } catch {
    // an unloadable config must not break linting
    return false;
  }
}
