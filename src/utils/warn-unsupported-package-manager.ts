import * as p from "@clack/prompts";
import c from "picocolors";

import { BUG_TRACKER_URL } from "../constants";
import {
  PACKAGE_MANAGER_CONFIGS,
  SUPPORTED_PACKAGE_MANAGERS,
} from "../constants/package-managers";
import { checkIsNonInteractive } from "./check-is-non-interactive";

export const warnUnsupportedPackageManager = ({
  userAgent,
}: {
  userAgent: string | null;
}) => {
  const packageManager = userAgent ?? "<nieznany>";
  const warningMessage = `\
${c.red(c.bold(`⚠️  OSTRZEŻENIE: ${packageManager} nie jest obsługiwany ⚠️`))}

Próbujesz uruchomić ten skrypt ${c.yellow(packageManager)}-em, ale @solvro/config obecnie działa tylko z następującymi menedżerami pakietów:

${SUPPORTED_PACKAGE_MANAGERS.map((manager) => c.white(`- ${c.cyan(manager)}`)).join("\n")}

${c.white(`Chcesz, aby dodano wsparcie dla ${c.yellow(packageManager)}-a? Daj nam znać!`)}
${c.white(c.underline(BUG_TRACKER_URL))}

${c.white(`W międzyczasie użyj innego menedżera:`)}

${Object.values(PACKAGE_MANAGER_CONFIGS)
  .map((config) => c.cyan(`${config.downloadExecute} @solvro/config`))
  .join(c.white("\nlub\n"))}`;

  if (checkIsNonInteractive()) {
    console.error(warningMessage);
  } else {
    p.cancel(warningMessage);
  }
};
