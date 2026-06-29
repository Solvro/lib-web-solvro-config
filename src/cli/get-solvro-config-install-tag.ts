import semver from "semver";

export const getSolvroConfigInstallTag = (version: string) =>
  semver.prerelease(version)?.[0] === "beta" ? "beta" : "latest";
