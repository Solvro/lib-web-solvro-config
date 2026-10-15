import * as p from "@clack/prompts";

import { BUG_TRACKER_URL } from "../constants";
import { hasUserConfirmed } from "./has-user-confirmed";

export const confirmProjectType = async (projectType: string) => {
  const isConfirmed = await hasUserConfirmed({
    message: `Wygląda jakbyś używał ${projectType}'a. Czy to się zgadza?`,
  });

  if (!isConfirmed) {
    p.cancel(
      `:( Zgłoś błąd na GitHubie, a my spróbujemy pomóc: ${BUG_TRACKER_URL}`,
    );
    process.exit(1);
  }
};
