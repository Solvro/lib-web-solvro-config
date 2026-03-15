import type {
  PackageManager,
  PackageManagerConfig,
} from "../../src/constants/package-managers";
import { PACKAGE_MANAGER_CONFIGS } from "../../src/constants/package-managers";
import { isSupportedPackageManager } from "../../src/utils/is-supported-package-manager";

/**
 * Get the current package manager for testing from environment variable.
 * Falls back to 'npm' if not set (for local development).
 */
export function getCurrentPackageManager(): PackageManagerConfig {
  const manager = process.env.PACKAGE_MANAGER;
  const packageManager: PackageManager = isSupportedPackageManager(manager)
    ? manager
    : "npm";
  return PACKAGE_MANAGER_CONFIGS[packageManager];
}
