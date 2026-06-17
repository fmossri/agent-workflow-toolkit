import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  }
});

describe("scaffold-docs-structure (consumer smoke)", () => {
  it("copies from package templates into --target without duplicating templates tree", () => {
    const target = mkdtempSync(join(tmpdir(), "agent-workflow-scaffold-"));
    tempDirs.push(target);

    execSync(
      `node src/scaffold-docs-structure.ts --target "${target}" --project-name "Smoke App" --project-description "Smoke test project."`,
      { cwd: PACKAGE_ROOT, stdio: "pipe" },
    );

    expect(existsSync(join(target, "AGENTS.md"))).toBe(true);
    expect(readFileSync(join(target, "AGENTS.md"), "utf8")).toContain("Smoke App");
    expect(existsSync(join(target, "docs/specs/features/README.md"))).toBe(true);
    expect(existsSync(join(target, "templates"))).toBe(false);
    expect(existsSync(join(target, "packages"))).toBe(false);
  });
});
