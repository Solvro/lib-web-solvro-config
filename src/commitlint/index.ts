import { type UserConfig } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  helpUrl: "https://docs.solvro.pl/guides/github/#nazewnictwo-commit%C3%B3w",
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        // Boring changes
        "chore",
        // Changes to CI workflows
        "ci",
        // Documentation-only changes
        "docs",
        // A new feature
        "feat",
        //A bug fix
        "fix",
        // A code change that neither fixes a bug nor adds a feature
        "refactor",
        // Adding missing tests or correcting existing tests
        "test",
        // For release commits
        "release",
      ],
    ],
    "body-max-length": [0, "always", Infinity],
  },
};

export default Configuration;
