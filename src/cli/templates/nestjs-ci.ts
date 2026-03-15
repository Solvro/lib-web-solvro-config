import type { PackageManagerConfig } from "../../constants";
import { commitLintCi } from "./commit-lint-ci";
import { nodeSetupCi } from "./node-setup-ci";

export const nestjsCi = ({
  nodeVersion,
  withCommitlint,
  manager,
}: {
  nodeVersion: string;
  withCommitlint: boolean;
  manager: PackageManagerConfig;
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

      - name: Run tests
        run: ${manager.name} test
        if: always()

      - name: Run e2e tests
        run: ${manager.runScript} test:e2e
        if: always()

      - name: Build
        run: ${manager.runScript} build
        if: always()
`;
