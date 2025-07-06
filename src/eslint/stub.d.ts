declare module "eslint-plugin-react-hooks" {
  import type { ESLint } from "eslint";

  const plugin: ESLint.Plugin;

  export = plugin;
}
declare module "eslint-plugin-import" {
  import type { ESLint, Linter } from "eslint";

  interface FlatConfig {
    languageOptions?: Linter.LanguageOptions;
    plugins?: Record<string, ESLint.Plugin>;
    rules?: Linter.RulesRecord;
    settings?: Record<string, unknown>;
  }

  interface FlatConfigs {
    recommended: FlatConfig;
    typescript: FlatConfig;
  }

  const plugin: ESLint.Plugin & {
    flatConfigs: FlatConfigs;
  };

  export = plugin;
}
declare module "eslint-plugin-react-refresh";
declare module "@adonisjs/eslint-config";
declare module "eslint-plugin-jsx-a11y" {
  import type { ESLint, Linter } from "eslint";

  interface FlatConfig {
    languageOptions?: Linter.LanguageOptions;
    plugins?: Record<string, ESLint.Plugin>;
    rules?: Linter.RulesRecord;
    settings?: Record<string, unknown>;
  }

  interface FlatConfigs {
    recommended: FlatConfig;
  }

  const plugin: ESLint.Plugin & {
    flatConfigs: FlatConfigs;
  };

  export = plugin;
}

declare module "@next/eslint-plugin-next" {
  import type { TSESLint } from "@typescript-eslint/utils";

  const plugin: TSESLint.FlatConfig.Plugin & {
    configs: {
      recommended: TSESLint.FlatConfig.Config;
    };
  };

  export = plugin;
}
