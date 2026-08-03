import { describe, expect, it } from "vitest";

import { getSolvroConfigInstallTag } from "../src/cli/get-solvro-config-install-tag";

describe("getSolvroConfigInstallTag", () => {
  it("uses the beta dist-tag for beta CLI versions", () => {
    expect(getSolvroConfigInstallTag("3.0.0-beta.8")).toBe("beta");
  });

  it("uses the latest dist-tag for stable CLI versions", () => {
    expect(getSolvroConfigInstallTag("3.0.0")).toBe("latest");
  });

  it("uses the latest dist-tag for non-beta prereleases", () => {
    expect(getSolvroConfigInstallTag("3.0.0-alpha.1")).toBe("latest");
  });
});
