import type { PackageManagerConfig } from "../../constants";
import { nodeSetupCi } from "./node-setup-ci";

export const checkDirtyLockfileCi = ({
  nodeVersion,
  manager,
  pnpmVersion,
}: {
  nodeVersion: string;
  manager: PackageManagerConfig;
  pnpmVersion?: string;
}) => `name: Ensure clean ${manager.lockfile}

on:
  pull_request:
    branches:
      - main
    paths:
      - "**/package.json"
      - "**/${manager.lockfile}"

permissions:
  contents: read

jobs:
  check-lockfile:
    runs-on: ubuntu-latest

    steps:
${nodeSetupCi({ nodeVersion, manager, pnpmVersion })}

      - name: Install dependencies
        run: ${manager.installDependencies}

      - name: Check for ${manager.lockfile} changes
        run: |
          if git diff --exit-code ${manager.lockfile} >/dev/null; then
            echo "${manager.lockfile} is clean :)"
          else
            echo "${manager.lockfile} changed after running ${manager.installDependencies}. Please commit the updated lockfile." >&2
            git diff --exit-code ${manager.lockfile}
          fi
`;
