import { readFileSync } from "node:fs";

const getPackageJsonUrl = () => {
  const packageJsonUrl = new URL("../../package.json", import.meta.url);
  return packageJsonUrl;
};

const getPackageJson = () => {
  const packageJson = JSON.parse(readFileSync(getPackageJsonUrl(), "utf8")) as {
    name?: string;
    version?: string;
  };

  return packageJson;
};

export const getPackageVersion = () => {
  const packageJson = getPackageJson();
  if (packageJson.version == null || packageJson.version.trim() === "") {
    return null;
  }
  return packageJson.version;
};

export const getPackageRoot = () => new URL("./", getPackageJsonUrl());
