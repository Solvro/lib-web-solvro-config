import * as p from "@clack/prompts";

import { BUG_TRACKER_URL } from "../constants";
import { polishConfirm } from "./polish-confirm";

export const confirmProjectType = async (projectType: string) => {
  const isConfirmed = await polishConfirm({
    message: `Wygląda jakbyś używał ${projectType}'a. Czy to się zgadza?`,
  });

  if (p.isCancel(isConfirmed)) {
    p.cancel("😡");
    process.exit(1);
  }

  if (!isConfirmed) {
    p.cancel(
      `:( Zgłoś błąd na GitHubie, a my spróbujemy pomóc: ${BUG_TRACKER_URL}`,
    );
    process.exit(1);
  }
};
