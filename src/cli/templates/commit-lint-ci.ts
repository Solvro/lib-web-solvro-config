export const commitLintCi = () => `
      - name: Check commit name
        if: github.event_name == 'pull_request'
        run: npx commitlint -f \${{ github.event.pull_request.base.sha }}
`;
