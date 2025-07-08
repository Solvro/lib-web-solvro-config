import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";
import type { ConfigWithExtends } from "typescript-eslint";

export function a11y(): ConfigWithExtends[] {
  return [
    {
      files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
      ...jsxA11y.flatConfigs.recommended,
      languageOptions: {
        ...jsxA11y.flatConfigs.recommended.languageOptions,
        globals: {
          ...globals.serviceworker,
          ...globals.browser,
        },
      },
      settings: {
        "jsx-a11y": {
          components: {
            Input: "input",
            Button: "button",
            Link: "a",
            Label: "label",
            Select: "select",
            Textarea: "textarea",
          },
          attributes: {
            for: ["htmlFor", "for"],
          },
        },
      },
    },
  ];
}
