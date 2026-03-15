import type { PackageManagerConfig } from "../../constants";

export const nextJsCi = ({ manager }: { manager: PackageManagerConfig }) => `
      - name: Setup build cache
        uses: actions/cache@v5
        with:
          path: \${{ github.workspace }}/.next/cache
          key: \${{ runner.os }}-nextjs-\${{ hashFiles('**/${manager.lockfile}') }}-\${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: |
            \${{ runner.os }}-nextjs-\${{ hashFiles('**/${manager.lockfile}') }}-
`;
