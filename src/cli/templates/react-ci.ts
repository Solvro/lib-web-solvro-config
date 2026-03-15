import type { PackageManagerConfig } from "../../constants";
import { commitLintCi } from "./commit-lint-ci";
import { nextJsCi } from "./nextjs-ci";
import { nodeSetupCi } from "./node-setup-ci";

export const reactCi = ({
  nodeVersion,
  withCommitlint,
  manager,
  usingNextJs,
}: {
  nodeVersion: string;
  withCommitlint: boolean;
  manager: PackageManagerConfig;
  usingNextJs: boolean;
}) => `name: CI

on:
  push:
    branches: ["main"]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
${nodeSetupCi({ nodeVersion, manager })}
${usingNextJs ? nextJsCi({ manager }) : ""}
      - name: Install dependencies
        run: ${manager.cleanInstall}
${withCommitlint ? commitLintCi({ manager }) : ""}
      - name: Check formatting
        run: ${manager.runScript} format:check
        if: always()

      - name: Lint code
        run: ${manager.runScript} lint
        if: always()

      - name: Check types
        run: ${manager.runScript} types:check
        if: always()

      - name: Build
        run: ${manager.runScript} build
        if: always()
`;
