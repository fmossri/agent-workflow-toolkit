import { execSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

function runScaffold(target: string, extraArgs = ""): void {
  execSync(
    `node src/scaffold-docs-structure.ts --target "${target}" --project-name "Smoke App" --project-description "Smoke test project." ${extraArgs}`,
    { cwd: PACKAGE_ROOT, stdio: "pipe" },
  );
}

describe("scaffold-docs-structure (consumer smoke)", () => {
  it("copies docs from package templates into --target without duplicating templates tree", () => {
    const target = mkdtempSync(join(tmpdir(), "agent-workflow-scaffold-"));
    tempDirs.push(target);

    runScaffold(target);

    expect(existsSync(join(target, "AGENTS.md"))).toBe(true);
    expect(readFileSync(join(target, "AGENTS.md"), "utf8")).toContain("Smoke App");
    expect(existsSync(join(target, "docs/specs/features/README.md"))).toBe(true);
    expect(existsSync(join(target, "templates"))).toBe(false);
    expect(existsSync(join(target, "packages"))).toBe(false);
  });

  it("scaffolds .cursor with --with-cursor and wires package.json scripts", () => {
    const target = mkdtempSync(join(tmpdir(), "agent-workflow-scaffold-"));
    tempDirs.push(target);
    writeFileSync(
      join(target, "package.json"),
      `${JSON.stringify({ name: "smoke-app", private: true, scripts: {} }, null, 2)}\n`,
      "utf8",
    );

    runScaffold(target, "--with-cursor");

    expect(existsSync(join(target, ".cursor/rules/git-workflow.mdc"))).toBe(true);
    expect(existsSync(join(target, ".cursor/skills/create-adr/SKILL.md"))).toBe(true);
    expect(existsSync(join(target, ".cursor/skills/create-incident-report/SKILL.md"))).toBe(
      true,
    );
    expect(existsSync(join(target, ".cursor/skills/create-postmortem/SKILL.md"))).toBe(true);
    expect(existsSync(join(target, "docs/incident-reports/README.md"))).toBe(true);
    expect(existsSync(join(target, "docs/postmortems/README.md"))).toBe(true);
    expect(existsSync(join(target, ".cursor/rules/pattern-promotion.mdc"))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(target, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts["gen:scaffold-docs"]).toContain("@agent-workflow/generators");
    expect(pkg.scripts["doc-lint"]).toContain("@agent-workflow/doc-linter");
  });

  it("skips existing .cursor files unless --force", () => {
    const target = mkdtempSync(join(tmpdir(), "agent-workflow-scaffold-"));
    tempDirs.push(target);
    writeFileSync(join(target, "package.json"), '{"name":"x","private":true}\n', "utf8");
    mkdirSync(join(target, ".cursor/rules"), { recursive: true });
    writeFileSync(join(target, ".cursor/rules/git-workflow.mdc"), "CUSTOM\n", "utf8");

    runScaffold(target, "--with-cursor");

    expect(readFileSync(join(target, ".cursor/rules/git-workflow.mdc"), "utf8")).toBe(
      "CUSTOM\n",
    );
    expect(existsSync(join(target, ".cursor/rules/kickstart.mdc"))).toBe(true);
  });
});
