import { $ } from "execa";

import { gitRoot } from "./git-root";

export const $$ = $({
  cwd: gitRoot(),
});
