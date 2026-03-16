import type { PackageManagerConfig } from "../../constants";
import { pnpmSetupCi } from "./pnpm-setup-ci";

export const nodeSetupCi = ({
  nodeVersion,
  manager,
  pnpmVersion,
}: {
  nodeVersion: string;
  manager: PackageManagerConfig;
  pnpmVersion?: string;
}) => `\
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Setup node
        uses: actions/setup-node@v6
        with:
          node-version: ${nodeVersion}
          cache: "${manager.name}"${manager.name === "pnpm" ? pnpmSetupCi({ pnpmVersion }) : ""}`;
