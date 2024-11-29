const requirePackage = require("./utils/require-package");

requirePackage("next", "@next/eslint-plugin-next");

module.exports = {
  extends: ["plugin:@next/next/recommended"],
};
