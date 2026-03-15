import * as p from "@clack/prompts";
import c from "picocolors";

import type { PackageManagerConfig } from "../constants";
import { checkIsNonInteractive } from "./check-is-non-interactive";

export const warnMissingLockfile = ({
  manager,
}: {
  manager: PackageManagerConfig;
}) => {
  const warningMessage = `\
${c.red(c.bold(`⚠️  OSTRZEŻENIE: brak pliku blokady ⚠️`))}

Próbujesz uruchomić ten skrypt ${c.yellow(manager.name)}-em, ale nie wykryto pliku ${c.yellow(manager.lockfile)}.

${c.white(`Sprawdź, czy ten projekt na pewno korzysta z menedżera pakietów ${c.yellow(manager.name)}.`)}
${c.white("Jeśli to się zgadza, zainstaluj najpierw zależności projektu i spróbuj ponownie:")}

${c.cyan(manager.installDependencies)}
${c.cyan(`${manager.downloadExecute} @solvro/config@latest`)}`;

  if (checkIsNonInteractive()) {
    console.error(warningMessage);
  } else {
    p.cancel(warningMessage);
  }
};
