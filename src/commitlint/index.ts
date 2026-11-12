import { RuleConfigSeverity } from "@commitlint/types";
import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  helpUrl: "https://docs.solvro.pl/git-github/solvro#nazewnictwo-commit%C3%B3w",
  rules: {
    "type-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        // A new feature
        "feat",
        //A bug fix
        "fix",
        // A code change that neither fixes a bug nor adds a feature
        "refactor",
        // Boring changes
        "chore",
        // Documentation-only changes
        "docs",
        // Changes to CI workflows
        "ci",
        // Adding missing tests or correcting existing tests
        "test",
        "build",
        "release",
      ],
    ],

    "body-max-length": [RuleConfigSeverity.Disabled],
    "body-max-line-length": [RuleConfigSeverity.Disabled],
    "footer-max-length": [RuleConfigSeverity.Disabled],
    "footer-max-line-length": [RuleConfigSeverity.Disabled],
  },
};

// eslint-disable-next-line import-x/no-default-export
export default config;
