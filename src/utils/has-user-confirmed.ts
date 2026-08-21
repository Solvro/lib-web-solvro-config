import * as p from "@clack/prompts";
import isInteractive from "is-interactive";

export const hasUserConfirmed = async (props: p.ConfirmOptions) => {
  if (!isInteractive()) {
    return true;
  }

  const result = await p.confirm({
    active: "Tak",
    inactive: "Nie",
    ...props,
  });

  if (p.isCancel(result)) {
    p.cancel("😡");
    process.exit(1);
  }

  return result;
};
