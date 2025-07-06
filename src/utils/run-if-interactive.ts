import isInteractive from "is-interactive";

export const runIfInteractive = <T>(fn: () => T): T | undefined => {
  if (isInteractive()) {
    return fn();
  }

  return undefined;
};
