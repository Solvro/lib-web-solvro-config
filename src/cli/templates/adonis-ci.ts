export const adonisCi = ({ nodeVersion }: { nodeVersion: string }) => `name: CI

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

      - name: Setup node
        uses: actions/setup-node@v4
        with:
          node-version: ${nodeVersion}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Set up AdonisJS environment
        run: |
          cp .env.example .env
          node ace generate:key

      - name: Run prettier
        run: npm run format:check
        if: always()

      - name: Run Lint
        run: npm run lint
        if: always()

      - name: Check types
        run: npm run typecheck
        if: always()

      - name: Run tests
        run: npm test
        if: always()

      - name: Build
        run: npm run build
        if: always()`;
