import jsxA11y from "eslint-plugin-jsx-a11y";
import type { ConfigWithExtends } from "typescript-eslint";

export function a11y(): ConfigWithExtends[] {
  return [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...jsxA11y.flatConfigs.strict,
      name: "solvro/a11y/rules",
    },
  ];
}
