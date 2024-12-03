import type { Linter } from "eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";

export function a11y(): Linter.Config[] {
  return [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...jsxA11y.flatConfigs.strict,
      name: "solvro/a11y/rules",
    },
  ];
}
