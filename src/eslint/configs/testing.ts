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
            "playwright/require-top-level-describe": "error",
            "playwright/prefer-hooks-on-top": "warn",
            "playwright/prefer-hooks-in-order": "warn",
            "playwright/prefer-equality-matcher": "error",
            "playwright/no-raw-locators": "warn",
          },
        },
      ] as const satisfies ConfigWithExtends[])
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
            "vitest/consistent-test-it": [
              "error",
              {
                fn: "it",
              },
            ],
            "vitest/no-focused-tests": ["warn"],
            "vitest/no-mocks-import": ["error"],
            "vitest/no-test-return-statement": ["error"],
            "vitest/prefer-lowercase-title": ["error"],
            "vitest/require-top-level-describe": ["warn"],
            "vitest/prefer-vi-mocked": ["error"],
            "vitest/prefer-hooks-in-order": ["warn"],
            "vitest/prefer-hooks-on-top": ["warn"],
            "vitest/prefer-each": ["warn"],
            "vitest/no-conditional-tests": ["error"],
            "vitest/prefer-comparison-matcher": ["error"],
            "vitest/no-conditional-in-test": ["warn"],
            "vitest/consistent-vitest-vi": ["error"],
          },
        },
      ] as const satisfies ConfigWithExtends[])
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
