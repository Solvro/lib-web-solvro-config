import isInteractive from "is-interactive";

export const runIfInteractive = <T>(function_: () => T): T | undefined => {
  if (isInteractive()) {
    return function_();
  }

  return undefined;
};
