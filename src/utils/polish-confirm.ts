import * as p from "@clack/prompts";

export const polishConfirm = async (props: p.ConfirmOptions) => {
  return p.confirm({
    active: "Tak",
    inactive: "Nie",
    ...props,
  });
};
