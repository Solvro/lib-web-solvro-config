import { solvro } from "./eslint-config";

export default solvro(
  {
    react: true,
    typescript: true,
    formatters: true,
    type: "lib",
  },
  {
    ignores: ["fixtures", "_fixtures"],
  },
  {
    files: ["src/**/*.ts"],
    rules: {
      "perfectionist/sort-objects": "error",
    } as const,
  },
);
