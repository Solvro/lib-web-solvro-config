import tseslint from "typescript-eslint";
import type { ConfigWithExtends } from "typescript-eslint";

import { pluginAntfu } from "../plugins";

export function typescriptStrict(): ConfigWithExtends[] {
  return [
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      name: "solvro/typescript-strict/setup",
      plugins: {
        antfu: pluginAntfu,
      },
    },
    {
      files: ["**/*.{ts,tsx}"],
      name: "solvro/typescript-strict/rules",
      rules: {
        "@typescript-eslint/ban-ts-comment": [
          "error",
          { "ts-expect-error": "allow-with-description" },
        ],
        "@typescript-eslint/consistent-type-definitions": [
          "error",
          "interface",
        ],
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            disallowTypeAnnotations: false,
            prefer: "type-imports",
          },
        ],
        "@typescript-eslint/method-signature-style": ["error", "property"], // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
        "@typescript-eslint/no-dupe-class-members": "error",
        "@typescript-eslint/no-dynamic-delete": "off",
        "@typescript-eslint/no-empty-object-type": [
          "error",
          { allowInterfaces: "always" },
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-extraneous-class": "off",
        "@typescript-eslint/no-import-type-side-effects": "error",
        "@typescript-eslint/no-invalid-void-type": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-redeclare": ["error", { builtinGlobals: false }],
        "@typescript-eslint/no-require-imports": "error",
        "@typescript-eslint/no-unused-expressions": [
          "error",
          {
            allowShortCircuit: true,
            allowTaggedTemplates: true,
            allowTernary: true,
          },
        ],
        "@typescript-eslint/no-use-before-define": [
          "error",
          { classes: false, functions: false, variables: true },
        ],
        "@typescript-eslint/no-useless-constructor": "off",
        "@typescript-eslint/no-wrapper-object-types": "error",
        "@typescript-eslint/triple-slash-reference": "off",
        "@typescript-eslint/unified-signatures": "off",
        // prevent unnecessary use of void operator
        "@typescript-eslint/no-meaningless-void-operator": "error",
        // "using non-null assertions cancels the benefits of the strict
        // null-checking mode."
        // warn when one of the types in union / intersection overrides others
        "@typescript-eslint/no-redundant-type-constituents": "warn",
        // prevent variables shadowing
        "no-shadow": "error",
        "@typescript-eslint/no-shadow": "error",
        // prevent assignment of this, signals a wrong usage of it
        "@typescript-eslint/no-this-alias": "error",
        // prevent throwing non-error
        "no-throw-literal": "off",

        // prevent unnecessary explicitly adding a default type argument
        "@typescript-eslint/no-unnecessary-type-arguments": "error",
        // prevent unnecessary assertions that won't change the outcome
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        // prevent extending default types
        "@typescript-eslint/no-unnecessary-type-constraint": "error",
        // force typing out function arguments
        "@typescript-eslint/no-unsafe-argument": "error",
        // prevent usage of any via reassigning
        "@typescript-eslint/no-unsafe-assignment": "error",
        // prevent usage of any via calling it
        "@typescript-eslint/no-unsafe-call": "error",
        // prevent usage of any via using it's members
        "@typescript-eslint/no-unsafe-member-access": "error",
        // prevent reverting any from functions
        "@typescript-eslint/no-unsafe-return": "error",
        // prevent unused expressions
        "no-unused-expressions": "off",
        // var<'string'> = 'string' -> var = 'string' as const
        "@typescript-eslint/prefer-as-const": "error",
        // force initializing enums
        "@typescript-eslint/prefer-enum-initializers": "error",
        // prefer for x of obj to for let i = 0...
        "@typescript-eslint/prefer-for-of": "error",
        // prefer includes() to indexOf()
        "@typescript-eslint/prefer-includes": "error",
        // use literals for enum initialization
        "@typescript-eslint/prefer-literal-enum-member": "error",
        // prefer safe cascade of a value when dealing with undefined or null
        "@typescript-eslint/prefer-nullish-coalescing": "error",
        // prefer optional chaining (a?.b)
        "@typescript-eslint/prefer-optional-chain": "error",
        // prefer using type parameter for Array.reduce
        "@typescript-eslint/prefer-reduce-type-parameter": "error",
        // prefer RegExp#exec when no /g flag in regex
        "@typescript-eslint/prefer-regexp-exec": "error",
        // enforce `this` as a type when stating type for a method
        "@typescript-eslint/prefer-return-this-type": "error",
        // enforce startsWith to indexOf === 0
        "@typescript-eslint/prefer-string-starts-ends-with": "error",
        // prevents default behavior of .sort() - which is confusing
        "@typescript-eslint/require-array-sort-compare": "error",
        // no async functions without awaits in body
        "require-await": "off",
        "@typescript-eslint/require-await": "error",
        // prevent number + string
        "@typescript-eslint/restrict-plus-operands": "error",
        // only allow string in templates
        "@typescript-eslint/restrict-template-expressions": "error",
        // prevent returning await
        "no-return-await": "off",
        "@typescript-eslint/return-await": "error",
        // only booleans in ifs and whiles
        "@typescript-eslint/strict-boolean-expressions": "error",
        // check if all paths are followed in code
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "dot-notation": "off",
        "no-implied-eval": "off",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/dot-notation": ["error", { allowKeywords: true }],
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-for-in-array": "error",
        "@typescript-eslint/no-implied-eval": "error",
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/promise-function-async": "error",
        "@typescript-eslint/unbound-method": "error",
      },
    },
  ];
}
