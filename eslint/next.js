const requirePackage = require("./utils/require-package");

requirePackage("next", "@next/eslint-plugin-next");

module.exports = {
  extends: ["plugin:@next/next/recommended"],
  overrides: [
    {
      files: [
        "**/pages/**/*.{js,ts,jsx,tsx}",
        "**/app/**/{loading,layout,page,template}.{js,ts,jsx,tsx}",
      ],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};
