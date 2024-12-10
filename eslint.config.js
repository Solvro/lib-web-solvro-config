import { solvro } from "./dist/eslint/index.js";

export default solvro({
  files: ["./src/cli/**/*.ts"],
  rules: {
    "unicorn/no-process-exit": "off",
  },
});
