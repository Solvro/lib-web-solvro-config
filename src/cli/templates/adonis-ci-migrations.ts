export const adonisMigrationsCi = () => `name: Migration check

on:
  pull_request:
    branches: ["*"]
  push:
    branches: ["main"]

jobs:
  migration-check:
    runs-on: ubuntu-latest
    env:
      DB_HOST: 127.0.0.1
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_DATABASE: postgres

    services:
      postgres:
        image: postgres
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Check out repository code
        uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Set up AdonisJS environment
        run: |
          cp .env.example .env
          node ace generate:key

      - name: Run AdonisJS migrations
        run: node ace migration:run

      - name: Rollback and rerun AdonisJS migrations
        run: node ace migration:refresh
`;
