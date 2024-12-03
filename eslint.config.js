// eslint-disable-next-line antfu/no-import-dist
import { solvro } from "./dist/eslint-config/index.js";

export default solvro([
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  { ignores: ["dist/**/*"] },
]);
