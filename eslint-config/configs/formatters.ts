import type { TypedFlatConfigItem } from "../types";
import { ensurePackages, interopDefault } from "../utils";

export async function formatters(): Promise<TypedFlatConfigItem[]> {
  await ensurePackages(["eslint-plugin-prettier"]);

  const prettierConfig = await interopDefault(import("eslint-config-prettier"));
  return [prettierConfig];
}
