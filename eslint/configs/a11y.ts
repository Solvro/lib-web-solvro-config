import type { Linter } from "eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";

export function a11y(): Linter.Config[] {
  return [
    {
      ...jsxA11y.flatConfigs.strict,
      name: "solvro/a11y/rules",
    },
  ];
}
