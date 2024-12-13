export const commitLintCi = () =>
  `      - name: Run commitlint check
        run: npx commitlint -f \${{ github.event.pull_request.base.sha }}
`;
