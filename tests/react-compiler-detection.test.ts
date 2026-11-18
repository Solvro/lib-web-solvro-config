import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { hasNextReactCompiler } from "../src/eslint/configs/react";

function detect(config?: string) {
  const dir = mkdtempSync(path.join(tmpdir(), "rc-"));
  if (config !== undefined) {
    writeFileSync(path.join(dir, "next.config.ts"), config);
  }
  return hasNextReactCompiler(dir);
}

describe("hasNextReactCompiler", () => {
  it("detects enabled compiler", () => {
    expect(detect("export default { reactCompiler: true };")).toBe(true);
    expect(
      detect(
        "export default { reactCompiler: { compilationMode: 'annotation' } };",
      ),
    ).toBe(true);
  });

  it("ignores disabled, commented or missing", () => {
    expect(detect("export default { reactCompiler: false };")).toBe(false);
    expect(detect("// reactCompiler: true\nexport default {};")).toBe(false);
    expect(detect()).toBe(false);
  });
});
