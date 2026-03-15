export type PackageManager = "npm" | "pnpm";

export interface PackageManagerConfig {
  name: string;
  lockfile: string;
  installPackage: string;
  installDependencies: string;
  cleanInstall: string;
  downloadExecute: string;
  localExecute: string;
  runScript: string;
}

export const PACKAGE_MANAGER_CONFIGS = {
  npm: {
    name: "npm",
    lockfile: "package-lock.json",
    installPackage: "npm install",
    installDependencies: "npm install",
    cleanInstall: "npm ci",
    downloadExecute: "npx",
    localExecute: "npx",
    runScript: "npm run",
  },
  pnpm: {
    name: "pnpm",
    lockfile: "pnpm-lock.yaml",
    installPackage: "pnpm add",
    installDependencies: "pnpm install",
    cleanInstall: "pnpm install --frozen-lockfile",
    downloadExecute: "pnpm dlx",
    localExecute: "pnpm exec",
    runScript: "pnpm run",
  },
} satisfies Record<PackageManager, PackageManagerConfig>;

export const SUPPORTED_PACKAGE_MANAGERS = Object.keys(PACKAGE_MANAGER_CONFIGS);
