import * as p from "@clack/prompts";
import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";

import { gitRoot } from "../../utils/git-root";

interface TsConfig {
  compilerOptions: {
    module?: string;
    isolatedModules?: boolean;
    moduleResolution?: string;
    allowJs?: boolean;
    [key: string]: unknown; // For other compiler options
  };
  [key: string]: unknown; // For other top-level properties
}

const root = gitRoot();
// - nodenext w tsconfig, isolated modules i allowjs
export const updateTsConfig = async () => {
  const tsConfigPath = `${root}/tsconfig.json`;

  if (!existsSync(tsConfigPath)) {
    p.cancel(
      "Nie znaleziono pliku tsconfig.json. Upewnij się, że jesteś w katalogu projektu.",
    );
    process.exit(1);
  }

  const tsConfigContent = JSON.parse(
    await fs.readFile(tsConfigPath, "utf8"),
  ) as TsConfig;

  tsConfigContent.compilerOptions = {
    ...tsConfigContent.compilerOptions,
    module: "nodenext",
    moduleResolution: "nodenext",
    isolatedModules: true,
    allowJs: true,
  };

  await fs.writeFile(tsConfigPath, JSON.stringify(tsConfigContent, null, 2));
};
