/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    "main",
    {
      name: "beta",
      prerelease: true,
    },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        // eslint-disable-next-line no-template-curly-in-string -- required by `semantic-release`.
        message: "chore(release): ${nextRelease.version} [skip ci]",
      },
    ],
  ],
};
