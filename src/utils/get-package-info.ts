import { readFileSync } from "node:fs";
import c from "picocolors";
import * as semver from "semver";

const getPackageJsonUrl = () => {
  const packageJsonUrl = new URL("../../package.json", import.meta.url);
  return packageJsonUrl;
};

const getPackageJson = () =>
  JSON.parse(readFileSync(getPackageJsonUrl(), "utf8")) as {
    name?: unknown;
    version?: unknown;
  };

export const getPackageVersion = ():
  | { version: null; versionParseError: string }
  | {
      version: string;
      versionParseError: string | null;
    } => {
  let packageJson;
  try {
    packageJson = getPackageJson();
  } catch {
    return {
      version: null,
      versionParseError: `Nie udało się odczytać pliku ${c.yellow("package.json")}. Nie można określić wersji pakietu.`,
    };
  }
  if (packageJson.version == null) {
    return {
      version: null,
      versionParseError: `Plik ${c.yellow("package.json")} nie zawiera pola ${c.green("version")}. Nie można określić wersji pakietu.`,
    };
  }
  if (typeof packageJson.version !== "string") {
    return {
      version: null,
      versionParseError: `Pole ${c.green("version")} w pliku ${c.yellow("package.json")} nie jest typu ${c.cyan("string")}. Nie można określić wersji pakietu.`,
    };
  }
  const trimmed = packageJson.version.trim();
  if (trimmed === "") {
    return {
      version: null,
      versionParseError: `Pole ${c.green("version")} w pliku ${c.yellow("package.json")} jest puste. Nie można określić wersji pakietu.`,
    };
  }
  const version = semver.parse(trimmed);
  if (version == null) {
    return {
      version: trimmed,
      versionParseError: `Niewłaściwy format pola ${c.green("version")} w pliku ${c.yellow("package.json")}: ${c.red(`"${trimmed}"`)}.`,
    };
  }
  return { version: trimmed, versionParseError: null };
};

export const getPackageRoot = () => new URL("./", getPackageJsonUrl());
