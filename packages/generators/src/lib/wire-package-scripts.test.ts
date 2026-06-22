import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { TOOLKIT_PACKAGE_SCRIPTS, wirePackageScripts } from "./wire-package-scripts.ts";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  }
});

describe("wirePackageScripts", () => {
  it("adds missing gen:* and doc-lint scripts without overwriting existing keys", () => {
    const target = mkdtempSync(join(tmpdir(), "agent-workflow-wire-"));
    tempDirs.push(target);
    writeFileSync(
      join(target, "package.json"),
      `${JSON.stringify(
        {
          name: "app",
          private: true,
          scripts: { lint: "eslint ." },
          devDependencies: { tsx: "^4.0.0" },
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const result = wirePackageScripts(target);
    expect(result.added).toContain("gen:scaffold-docs");
    expect(result.added).toContain("gen:create-incident-report");
    expect(result.added).toContain("gen:create-postmortem");
    expect(result.skipped).not.toContain("lint");

    const pkg = JSON.parse(readFileSync(join(target, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.lint).toBe("eslint .");
    expect(pkg.scripts["gen:create-adr"]).toBe(TOOLKIT_PACKAGE_SCRIPTS["gen:create-adr"]);
  });

  it("warns when package.json is missing", () => {
    const target = mkdtempSync(join(tmpdir(), "agent-workflow-wire-"));
    tempDirs.push(target);
    const result = wirePackageScripts(target);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(existsSync(join(target, "package.json"))).toBe(false);
  });
});
