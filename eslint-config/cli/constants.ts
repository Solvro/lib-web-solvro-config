import c from "picocolors";

import pkgJson from "../../package.json";
import type { FrameworkOption, PromItem } from "./types";

export { pkgJson };

export const vscodeSettingsString = `
  "prettier.enable": true,
  "editor.formatOnSave": true,
`;

export const frameworkOptions: PromItem<FrameworkOption>[] = [
  {
    label: c.cyan("React"),
    value: "react",
  },
];

export const frameworks: FrameworkOption[] = frameworkOptions.map(
  ({ value }) => value,
);

export const dependenciesMap = {
  react: [
    "@eslint-react/eslint-plugin",
    "eslint-plugin-react-hooks",
    "eslint-plugin-react-refresh",
  ],
} as const;
