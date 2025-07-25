import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  helpUrl: "https://docs.solvro.pl/github#nazewnictwo-commit%C3%B3w",
  rules: {
    "type-enum": [
      2,
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

    // @ts-expect-error ???
    "body-max-length": [0, "always"],
    // @ts-expect-error ???
    "body-max-line-length": [0, "always"],
    // @ts-expect-error ???
    "footer-max-length": [0, "always"],
    // @ts-expect-error ???
    "footer-max-line-length": [0, "always"],
  },
};

// eslint-disable-next-line import/no-default-export
export default config;
