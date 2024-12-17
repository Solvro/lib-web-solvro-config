export const commitLintCi = () => `
      - name: Check commit name
        if: github.event_name == 'pull_request'
        run: npx commitlint --from \${{ github.event.pull_request.base.sha }} --to \${{ github.event.pull_request.head.sha }} --verbose
`;
