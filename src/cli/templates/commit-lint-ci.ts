import type { PackageManagerConfig } from "../../constants";

export const commitLintCi = ({
  manager,
}: {
  manager: PackageManagerConfig;
}) => `
      - name: Check commit name
        if: github.event_name == 'pull_request'
        run: ${manager.localExecute} commitlint --from \${{ github.event.pull_request.base.sha }} --to \${{ github.event.pull_request.head.sha }} --verbose
`;
