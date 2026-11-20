import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { hasNextReactCompiler } from "../src/utils/has-next-react-compiler";

async function detect(config?: string, file = "next.config.ts") {
  const dir = mkdtempSync(path.join(tmpdir(), "rc-"));
  if (config !== undefined) {
    writeFileSync(path.join(dir, file), config);
  }
  return hasNextReactCompiler(dir);
}

describe("hasNextReactCompiler", () => {
  it("detects enabled compiler", async () => {
    expect(await detect("export default { reactCompiler: true };")).toBe(true);
    expect(
      await detect(
        "export default { reactCompiler: { compilationMode: 'annotation' } };",
      ),
    ).toBe(true);
    expect(
      await detect(
        "module.exports = { experimental: { reactCompiler: true } };",
        "next.config.js",
      ),
    ).toBe(true);
    expect(
      await detect(
        "export default async () => ({ reactCompiler: true });",
        "next.config.mjs",
      ),
    ).toBe(true);
  });

  it("ignores disabled, commented, broken or missing config", async () => {
    expect(await detect("export default { reactCompiler: false };")).toBe(
      false,
    );
    expect(await detect("// reactCompiler: true\nexport default {};")).toBe(
      false,
    );
    expect(await detect("throw new Error('boom');")).toBe(false);
    expect(await detect()).toBe(false);
  });
});
