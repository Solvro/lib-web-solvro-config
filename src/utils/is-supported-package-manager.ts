import type { PackageManager } from "../constants";
import { SUPPORTED_PACKAGE_MANAGERS } from "../constants";

export const isSupportedPackageManager = (
  userAgent: string | null | undefined,
): userAgent is PackageManager =>
  userAgent != null && SUPPORTED_PACKAGE_MANAGERS.includes(userAgent);
