import { execa } from "execa";

/** Wrapper for `execa` */
export async function execSimple(
  command: string,
  arguments_: string[] = [],
  options: any = {},
): Promise<{ stdout: string; stderr: string }> {
  const result = await execa(command, arguments_, options);
  return {
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}
