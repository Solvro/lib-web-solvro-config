import vitest from "@vitest/eslint-plugin";
import jest from "eslint-plugin-jest";
import playwright from "eslint-plugin-playwright";
import { isPackageListed } from "local-pkg";
import type { ConfigWithExtends } from "typescript-eslint";

export const testing = async ({
  testFiles = ["**/*.test.ts", "**/*.test.tsx"],
  playwrightTestFiles = ["tests/**"],
}: {
  testFiles: string[];
  playwrightTestFiles: string[];
}): Promise<ConfigWithExtends[]> => {
  const isVitest = await isPackageListed("vitest");
  const isJest = await isPackageListed("jest");
  const isPlaywright = await isPackageListed("@playwright/test");

  const playwrightConfig = isPlaywright
    ? ([
        {
          ...playwright.configs["flat/recommended"],
          files: playwrightTestFiles,
          rules: {
            ...playwright.configs["flat/recommended"].rules,
            "playwright/prefer-native-locators": "warn",
            "playwright/prefer-locator": "warn",
            "playwright/prefer-comparison-matcher": "warn",
          },
        },
      ] as const)
    : [];

  const vitestConfig = isVitest
    ? ([
        {
          files: testFiles,
          plugins: {
            vitest,
          },
          rules: {
            ...vitest.configs.recommended.rules,
          },
        },
      ] as const)
    : [];

  const jestConfig = isJest
    ? ([
        {
          files: testFiles,
          plugins: {
            jest,
          },
          rules: {
            ...jest.configs.recommended.rules,
          },
        },
      ] as const)
    : [];

  if (isVitest && isJest) {
    throw new Error(
      "Both Vitest and Jest are installed - please uninstall one of them.",
    );
  }

  return [...playwrightConfig, ...vitestConfig, ...jestConfig];
};
