import * as p from "@clack/prompts";
import c from "picocolors";

import type { PackageManagerConfig } from "../constants";
import {
  PACKAGE_MANAGER_CONFIGS,
  SUPPORTED_PACKAGE_MANAGERS,
} from "../constants";
import { checkIsNonInteractive } from "./check-is-non-interactive";
import { isSupportedPackageManager } from "./is-supported-package-manager";

const hintInstallWithDetected = (manager: PackageManagerConfig) => `
${c.white(`Upewnij się, że używasz właściwej komendy. Spróbuj jeszcze raz za pomocą ${c.yellow(manager.name)}-a:`)}

${c.cyan(`${manager.downloadExecute} @solvro/config@latest`)}`;

const warnUnsupported = (manager: string) => `
${c.white("@solvro/config obecnie działa tylko z następującymi menedżerami pakietów:")}

${SUPPORTED_PACKAGE_MANAGERS.map((supportedManager) => c.white(`- ${c.cyan(supportedManager)}`)).join("\n")}

Niestety, ${c.yellow(manager)} nie jest wspierany.`;

export const warnInconsistentUserAgent = ({
  userAgent,
  detectedPackageManager,
}: {
  userAgent: PackageManagerConfig;
  detectedPackageManager: string;
}) => {
  const warningMessage = `\
${c.red(c.bold(`⚠️  OSTRZEŻENIE: niespójny menedżer pakietów ⚠️`))}

Próbujesz uruchomić ten skrypt ${c.yellow(userAgent.name)}-em, ale w tym projekcie wykryto menedżer pakietów ${c.yellow(detectedPackageManager)}.
${
  isSupportedPackageManager(detectedPackageManager)
    ? hintInstallWithDetected(PACKAGE_MANAGER_CONFIGS[detectedPackageManager])
    : warnUnsupported(detectedPackageManager)
}`;

  if (checkIsNonInteractive()) {
    console.error(warningMessage);
  } else {
    p.cancel(warningMessage);
  }
};
