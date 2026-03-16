import { execa } from "execa";

/** Executes the given command with labelled logs, streaming process output to the console. */
export async function execWithLogging(
  command: string,
  arguments_: string[] = [],
  options: any = {},
  label?: string,
  {
    streamOutput = true,
    streamErrors = true,
  }: { streamOutput?: boolean; streamErrors?: boolean } = {},
): Promise<{ stdout: string; stderr: string }> {
  const displayLabel = label || command;
  console.debug(
    `🔧 [${displayLabel}] Running: ${command} ${arguments_.join(" ")}`,
  );

  try {
    const subprocess = execa(command, arguments_, {
      stdio: ["inherit", "pipe", "pipe"],
      ...options,
    });

    if (streamOutput) {
      subprocess.stdout?.on("data", (data) => {
        console.debug(`📤 [${displayLabel}] ${data.toString().trim()}`);
      });
    }

    if (streamErrors) {
      subprocess.stderr?.on("data", (data) => {
        console.debug(`⚠️  [${displayLabel}] ${data.toString().trim()}`);
      });
    }

    const result = await subprocess;
    console.debug(`✅ [${displayLabel}] Command completed successfully`);

    return {
      stdout: result.stdout || "",
      stderr: result.stderr || "",
    };
  } catch (error: any) {
    console.debug(`❌ [${displayLabel}] Command failed with error:`);
    throw error;
  }
}
