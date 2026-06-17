import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createAdr, nextAdrNumber, slugifyAdrTitle } from "./adr.ts";
import { copyTreeWithTemplates } from "./copy-tree.ts";
import { createFeatureSpec, validateFeatureSpecSlug } from "./feature-spec.ts";
import { fillTemplate } from "./template.ts";

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "agent-workflow-gen-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  }
});

describe("fillTemplate", () => {
  it("replaces known placeholders", () => {
    expect(fillTemplate("Hello {{NAME}}", { NAME: "world" })).toBe("Hello world");
  });

  it("leaves unknown placeholders intact", () => {
    expect(fillTemplate("{{MISSING}}", {})).toBe("{{MISSING}}");
  });
});

describe("slugifyAdrTitle", () => {
  it("kebab-cases titles", () => {
    expect(slugifyAdrTitle("Use PostgreSQL for persistence")).toBe(
      "use-postgresql-for-persistence",
    );
  });
});

describe("nextAdrNumber", () => {
  it("returns 0001 for an empty adr dir", () => {
    const dir = makeTempDir();
    expect(nextAdrNumber(dir)).toBe("0001");
  });

  it("increments from the highest existing file", () => {
    const dir = makeTempDir();
    writeFileSync(join(dir, "0003-foo.md"), "# ADR\n");
    writeFileSync(join(dir, "0010-bar.md"), "# ADR\n");
    expect(nextAdrNumber(dir)).toBe("0011");
  });
});

describe("createAdr", () => {
  it("writes the adr file and inserts an index row", () => {
    const root = makeTempDir();
    const adrDir = join(root, "adr");
    mkdirSync(adrDir, { recursive: true });
    writeFileSync(
      join(adrDir, "README.md"),
      `# ADRs

## Index

| #     | Title | Status |
| ----- | ----- | ------ |

## Template
`,
      "utf8",
    );

    const templatePath = join(root, "adr-template.md");
    writeFileSync(
      templatePath,
      `---
id: {{ADR_ID}}
title: "{{TITLE}}"
type: adr
status: {{STATUS}}
date: {{DATE}}
deciders: [{{DECIDERS}}]
supersedes: null
superseded_by: null
---

# {{ADR_ID}}: {{TITLE}}
`,
      "utf8",
    );

    const { num, filePath } = createAdr({
      adrDir,
      templatePath,
      title: "Test decision",
      slug: "test-decision",
      status: "Proposed",
      date: "2026-06-17",
      deciders: "owner",
    });

    expect(num).toBe("0001");
    expect(readFileSync(filePath, "utf8")).toContain("ADR-0001");
    expect(readFileSync(join(adrDir, "README.md"), "utf8")).toContain(
      "| [0001](0001-test-decision.md) | Test decision | Proposed |",
    );
  });
});

describe("copyTreeWithTemplates", () => {
  it("copies and fills placeholders", () => {
    const src = makeTempDir();
    const dest = makeTempDir();
    mkdirSync(join(src, "docs"), { recursive: true });
    writeFileSync(join(src, "AGENTS.md"), "# {{PROJECT_NAME}}\n", "utf8");
    writeFileSync(join(src, "docs", "README.md"), "Updated {{DATE}}\n", "utf8");

    const result = copyTreeWithTemplates(src, dest, { PROJECT_NAME: "Acme", DATE: "2026-06-17" });

    expect(readFileSync(join(dest, "AGENTS.md"), "utf8")).toBe("# Acme\n");
    expect(readFileSync(join(dest, "docs/README.md"), "utf8")).toBe("Updated 2026-06-17\n");
    expect(result.created).toHaveLength(2);
    expect(result.skipped).toHaveLength(0);
  });

  it("skips existing files by default (idempotent merge)", () => {
    const src = makeTempDir();
    const dest = makeTempDir();
    mkdirSync(join(src, "docs"), { recursive: true });
    writeFileSync(join(src, "AGENTS.md"), "# {{PROJECT_NAME}}\n", "utf8");
    writeFileSync(join(src, "docs", "architecture.md"), "template {{DATE}}\n", "utf8");
    mkdirSync(join(dest, "docs"), { recursive: true });
    writeFileSync(join(dest, "docs", "architecture.md"), "existing architecture\n", "utf8");

    const result = copyTreeWithTemplates(src, dest, { PROJECT_NAME: "Acme", DATE: "2026-06-17" });

    expect(readFileSync(join(dest, "AGENTS.md"), "utf8")).toBe("# Acme\n");
    expect(readFileSync(join(dest, "docs/architecture.md"), "utf8")).toBe(
      "existing architecture\n",
    );
    expect(result.created).toContain("AGENTS.md");
    expect(result.skipped).toContain(join("docs", "architecture.md"));
  });
});

describe("createFeatureSpec", () => {
  it("writes a feature spec under docs/specs/features/", () => {
    const root = makeTempDir();
    const templatePath = join(root, "feature-spec-template.md");
    writeFileSync(
      templatePath,
      `---
title: "Feature: {{SLUG}}"
type: feature-spec
status: Draft
updated: {{DATE}}
backlog_ids: [{{BACKLOG_ID}}]
---

# Feature: {{SLUG}}

## Goal

{{GOAL}}
`,
      "utf8",
    );

    const specPath = createFeatureSpec({
      repoRoot: root,
      templatePath,
      slug: "bill-listing",
      backlogId: "M1-6",
      goal: "List bills",
      date: "2026-06-17",
    });

    expect(specPath).toBe(join(root, "docs/specs/features/bill-listing.md"));
    expect(readFileSync(specPath, "utf8")).toContain("backlog_ids: [M1-6]");
    expect(readFileSync(specPath, "utf8")).toContain("List bills");
  });

  it("rejects invalid slugs", () => {
    expect(validateFeatureSpecSlug("Bill-Listing")).toBe(false);
    expect(validateFeatureSpecSlug("bill-listing")).toBe(true);
  });
});
