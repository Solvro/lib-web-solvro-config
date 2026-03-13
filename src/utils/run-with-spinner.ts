import * as p from "@clack/prompts";

import { runIfInteractive } from "./run-if-interactive";

/** Executes a callback using a clack spinner, printing the provided messages, with error handling. */
export const runWithSpinner = async (options: {
  start: string;
  stop: string;
  error: string;
  callback: () => void | Promise<void>;
}) => {
  const spinner = p.spinner();
  runIfInteractive(() => {
    spinner.start(options.start);
  });
  try {
    await options.callback();
  } catch (error) {
    runIfInteractive(() => {
      spinner.error(options.error);
    });
    throw error;
  }
  runIfInteractive(() => {
    spinner.stop(options.stop);
  });
};
