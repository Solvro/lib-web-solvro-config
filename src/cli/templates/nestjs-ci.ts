import { commitLintCi } from "./commit-lint-ci";

export const nestjsCi = ({
  nodeVersion,
  withCommitlint,
}: {
  nodeVersion: string;
  withCommitlint: boolean;
}) => `name: CI

on:
  push:
    branches: ["main"]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup node
        uses: actions/setup-node@v4
        with:
          node-version: ${nodeVersion}
          cache: "npm"

      - name: Install dependencies
        run: npm ci
${withCommitlint ? commitLintCi() : ""}
      - name: Check formatting
        run: npm run format:check
        if: always()

      - name: Lint code
        run: npm run lint
        if: always()

      - name: Check types
        run: npm run types:check
        if: always()

      - name: Run tests
        run: npm test
        if: always()

      - name: Run e2e tests
        run: npm run test:e2e
        if: always()

      - name: Build
        run: npm run build
        if: always()
`;
