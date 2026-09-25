import isInteractive from "is-interactive";

export const runIfInteractive = <T>(function_: () => T): T | undefined => {
  return isInteractive() ? function_() : undefined;
};
