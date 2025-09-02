export const nextJsCi = () => `
      - name: Setup build cache
        uses: actions/cache@v4
        with:
          path: \${{ github.workspace }}/.next/cache
          key: \${{ runner.os }}-nextjs-\${{ hashFiles('**/package-lock.json') }}-\${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: |
            \${{ runner.os }}-nextjs-\${{ hashFiles('**/package-lock.json') }}-            
`;
