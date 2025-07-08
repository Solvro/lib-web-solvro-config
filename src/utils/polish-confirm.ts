import * as p from "@clack/prompts";
import isInteractive from "is-interactive";

export const polishConfirm = async (props: p.ConfirmOptions) => {
  if (!isInteractive()) {
    return true;
  }

  return p.confirm({
    active: "Tak",
    inactive: "Nie",
    ...props,
  });
};
