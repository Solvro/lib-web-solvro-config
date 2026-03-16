export const pnpmSetupCi = ({
  pnpmVersion = "10",
}: { pnpmVersion?: string } = {}) => `

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${pnpmVersion}`;
