import { flatConfigsToRulesDTS } from "eslint-typegen/core";
import { builtinRules } from "eslint/use-at-your-own-risk";
import fs from "node:fs/promises";

import {
  combine,
  comments,
  formatters,
  imports,
  javascript,
  jsdoc,
  jsx,
  markdown,
  node,
  react,
  regexp,
  test,
  typescript,
  unicorn,
} from "../eslint-config";

const configs = await combine(
  {
    plugins: {
      "": {
        rules: Object.fromEntries(builtinRules.entries()),
      },
    },
  },
  comments(),
  formatters(),
  imports(),
  javascript(),
  jsx(),
  jsdoc(),

  markdown(),
  node(),
  react(),

  test(),

  regexp(),
  typescript(),
  unicorn(),
);

const configNames = configs.map((i) => i.name).filter(Boolean) as string[];

let dts = await flatConfigsToRulesDTS(configs, {
  includeAugmentation: false,
});

dts += `
// Names of all the configs
export type ConfigNames = ${configNames.map((i) => `'${i}'`).join(" | ")}
`;

await fs.writeFile("eslint-config/typegen.d.ts", dts);
