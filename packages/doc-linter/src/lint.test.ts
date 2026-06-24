import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { lintDocs } from "./lint.ts";
import type { Problem } from "./types.ts";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "doc-linter-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function write(relPath: string, content: string): void {
  const full = join(root, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

function run(): Problem[] {
  return lintDocs({ docsDir: join(root, "docs"), extraFiles: [join(root, "AGENTS.md")] });
}

function messages(): string[] {
  return run().map((problem) => problem.message);
}

const VALID_ADR = `---
id: ADR-0001
title: "First decision"
type: adr
status: Accepted
date: 2026-06-16
deciders: [owner]
supersedes: null
superseded_by: null
---

# ADR-0001
`;

const VALID_INDEX = `---
title: "ADRs"
type: index
updated: 2026-06-16
---

# ADRs

## Index

| #                 | Title          | Status   |
| ----------------- | -------------- | -------- |
| [0001](0001-first.md) | First decision | Accepted |
`;

function seedValidAdrs(): void {
  write("docs/adr/0001-first.md", VALID_ADR);
  write("docs/adr/README.md", VALID_INDEX);
}

describe("lintDocs — front-matter schema", () => {
  it("passes a conformant doc set", () => {
    seedValidAdrs();
    expect(run()).toEqual([]);
  });

  it("flags a doc with no front-matter", () => {
    write("docs/README.md", "# Just a heading, no front-matter\n");
    expect(messages().join("\n")).toContain("missing YAML front-matter");
  });

  it("flags a missing required field for the type", () => {
    seedValidAdrs();
    write("docs/adr/0001-first.md", VALID_ADR.replace("date: 2026-06-16\n", ""));
    expect(messages()).toContain('missing required field "date"');
  });

  it("does not leak the ajv if/then wrapper into messages", () => {
    seedValidAdrs();
    write("docs/adr/0001-first.md", VALID_ADR.replace("date: 2026-06-16\n", ""));
    expect(messages().some((m) => m.includes("then"))).toBe(false);
  });

  it("flags an out-of-vocabulary status enum", () => {
    seedValidAdrs();
    write("docs/adr/0001-first.md", VALID_ADR.replace("status: Accepted", "status: Done"));
    expect(messages().some((m) => m.includes("Proposed, Accepted, Superseded, Deprecated"))).toBe(
      true,
    );
  });

  it("flags a non-ISO date", () => {
    seedValidAdrs();
    write("docs/adr/0001-first.md", VALID_ADR.replace("date: 2026-06-16", "date: 2026-13-01"));
    expect(messages().some((m) => m.includes('must match format "date"'))).toBe(true);
  });

  it("flags a diary with more than five keywords", () => {
    write(
      "docs/agent-diaries/agent-diary-2026-06-17-1304.md",
      `---
title: "Diary"
type: diary
timestamp: "2026-06-17 13:04 (UTC-3)"
summary: "x"
keywords: [a, b, c, d, e, f]
---

# Diary
`,
    );
    expect(messages().some((m) => m.includes("must NOT have more than 5 items"))).toBe(true);
  });

  it("validates extra files such as AGENTS.md", () => {
    write("AGENTS.md", "# No front-matter here\n");
    expect(messages().join("\n")).toContain("missing YAML front-matter");
  });

  it("passes a conformant feature-spec", () => {
    write(
      "docs/specs/features/bill-listing.md",
      `---
title: "Feature: bill-listing"
type: feature-spec
status: Draft
updated: 2026-06-17
backlog_ids: [M1-6]
---

# Feature: bill-listing
`,
    );
    expect(run()).toEqual([]);
  });

  it("flags a feature-spec missing backlog_ids", () => {
    write(
      "docs/specs/features/bill-listing.md",
      `---
title: "Feature: bill-listing"
type: feature-spec
status: Draft
updated: 2026-06-17
---

# Feature: bill-listing
`,
    );
    expect(messages()).toContain('missing required field "backlog_ids"');
  });

  it("passes a conformant incident-report", () => {
    write(
      "docs/incident-reports/INC-2026-001-stale-panel.md",
      `---
title: "INC-2026-001: Stale panel"
type: incident-report
id: INC-2026-001
status: open
severity: medium
summary: "Users see old data"
updated: 2026-06-22
---

# INC-2026-001: Stale panel
`,
    );
    expect(run()).toEqual([]);
  });

  it("flags an incident-report with invalid severity", () => {
    write(
      "docs/incident-reports/INC-2026-001-stale-panel.md",
      `---
title: "INC-2026-001: Stale panel"
type: incident-report
id: INC-2026-001
status: open
severity: urgent
summary: "Users see old data"
updated: 2026-06-22
---

# INC-2026-001: Stale panel
`,
    );
    expect(messages().some((m) => m.includes("low, medium, high, critical"))).toBe(true);
  });

  it("passes a conformant postmortem linked to an incident", () => {
    write(
      "docs/incident-reports/INC-2026-001-stale-panel.md",
      `---
title: "INC-2026-001: Stale panel"
type: incident-report
id: INC-2026-001
status: resolved
severity: medium
summary: "Users see old data"
updated: 2026-06-22
---

# INC-2026-001: Stale panel
`,
    );
    write(
      "docs/postmortems/PM-2026-001-stale-panel-rca.md",
      `---
title: "PM-2026-001: Stale panel RCA"
type: postmortem
id: PM-2026-001
incident_id: INC-2026-001
status: draft
summary: "Cache TTL too long"
updated: 2026-06-22
---

# PM-2026-001: Stale panel RCA
`,
    );
    expect(run()).toEqual([]);
  });

  it("flags a postmortem missing incident_id", () => {
    write(
      "docs/postmortems/PM-2026-001-stale-panel-rca.md",
      `---
title: "PM-2026-001: Stale panel RCA"
type: postmortem
id: PM-2026-001
status: draft
summary: "Cache TTL too long"
updated: 2026-06-22
---

# PM-2026-001: Stale panel RCA
`,
    );
    expect(messages()).toContain('missing required field "incident_id"');
  });
});

describe("lintDocs — body structure", () => {
  const HEADER = `---
title: "Doc"
type: guide
status: living
updated: 2026-06-17
---
`;

  it("passes a single-H1 doc with a resolvable relative link", () => {
    write("docs/a.md", `${HEADER}\n# Title\n\nSee [b](b.md).\n`);
    write("docs/b.md", `${HEADER}\n# B\n`);
    expect(run()).toEqual([]);
  });

  it("flags more than one top-level H1", () => {
    write("docs/a.md", `${HEADER}\n# One\n\n# Two\n`);
    expect(messages().some((m) => m.includes('exactly one top-level "# " heading (found 2)'))).toBe(
      true,
    );
  });

  it("flags a missing H1", () => {
    write("docs/a.md", `${HEADER}\n## Only a subheading\n`);
    expect(messages().some((m) => m.includes("(found 0)"))).toBe(true);
  });

  it("flags a broken relative link", () => {
    write("docs/a.md", `${HEADER}\n# Title\n\nSee [ghost](ghost.md).\n`);
    expect(messages()).toContain('broken relative link "ghost.md" (file not found)');
  });

  it("ignores external links and pure in-page anchors", () => {
    write("docs/a.md", `${HEADER}\n# Title\n\n[ext](https://x.dev) and [jump](#title)\n`);
    expect(run()).toEqual([]);
  });

  it("ignores headings and links inside fenced code blocks", () => {
    write(
      "docs/a.md",
      `${HEADER}\n# Title\n\n\`\`\`md\n# not a real heading\n[nope](missing.md)\n\`\`\`\n`,
    );
    expect(run()).toEqual([]);
  });

  it("resolves a link with a #fragment by checking the file", () => {
    write("docs/a.md", `${HEADER}\n# Title\n\n[b section](b.md#part).\n`);
    write("docs/b.md", `${HEADER}\n# B\n`);
    expect(run()).toEqual([]);
  });
});

describe("lintDocs — ADR index sync", () => {
  it("flags an ADR file missing from the index", () => {
    seedValidAdrs();
    write("docs/adr/0002-second.md", VALID_ADR.replace("ADR-0001", "ADR-0002"));
    expect(messages().some((m) => m.includes("ADR 0002 is missing a row in the index"))).toBe(true);
  });

  it("flags an index row whose linked file does not exist", () => {
    seedValidAdrs();
    write(
      "docs/adr/README.md",
      VALID_INDEX.replace(
        "| [0001](0001-first.md) | First decision | Accepted |",
        "| [0001](0001-first.md) | First decision | Accepted |\n| [0002](0002-ghost.md) | Ghost | Accepted |",
      ),
    );
    expect(
      messages().some((m) => m.includes('links to "0002-ghost.md", which does not exist')),
    ).toBe(true);
  });

  it("flags an index status that disagrees with the ADR front-matter", () => {
    seedValidAdrs();
    write(
      "docs/adr/README.md",
      VALID_INDEX.replace(
        "| [0001](0001-first.md) | First decision | Accepted |",
        "| [0001](0001-first.md) | First decision | Superseded |",
      ),
    );
    expect(
      messages().some((m) => m.includes('index status "Superseded"') && m.includes("Accepted")),
    ).toBe(true);
  });

  it("matches a status word even when the index cell has trailing markdown", () => {
    seedValidAdrs();
    write(
      "docs/adr/README.md",
      VALID_INDEX.replace(
        "| [0001](0001-first.md) | First decision | Accepted |",
        "| [0001](0001-first.md) | First decision | Accepted (extends [0001](0001-first.md)) |",
      ),
    );
    expect(run()).toEqual([]);
  });

  it("flags a front-matter id that disagrees with the filename number", () => {
    seedValidAdrs();
    write("docs/adr/0001-first.md", VALID_ADR.replace("id: ADR-0001", "id: ADR-0009"));
    expect(
      messages().some((m) =>
        m.includes('front-matter id "ADR-0009" does not match filename number 0001'),
      ),
    ).toBe(true);
  });
});

describe("lintDocs — incident and postmortem sync", () => {
  const VALID_INCIDENT = `---
title: "INC-2026-001: Stale panel"
type: incident-report
id: INC-2026-001
status: resolved
severity: medium
summary: "Users see old data"
updated: 2026-06-22
---

# INC-2026-001: Stale panel
`;

  it("flags an incident id that disagrees with the filename", () => {
    write(
      "docs/incident-reports/INC-2026-001-stale-panel.md",
      VALID_INCIDENT.replace("id: INC-2026-001", "id: INC-2026-009"),
    );
    expect(
      messages().some((m) =>
        m.includes(
          'front-matter id "INC-2026-009" does not match filename (expected "INC-2026-001")',
        ),
      ),
    ).toBe(true);
  });

  it("flags a postmortem whose incident_id is missing", () => {
    write("docs/incident-reports/INC-2026-001-stale-panel.md", VALID_INCIDENT);
    write(
      "docs/postmortems/PM-2026-001-stale-panel-rca.md",
      `---
title: "PM-2026-001: Stale panel RCA"
type: postmortem
id: PM-2026-001
incident_id: INC-2026-099
status: draft
summary: "Cache TTL too long"
updated: 2026-06-22
---

# PM-2026-001: Stale panel RCA
`,
    );
    expect(
      messages().some((m) =>
        m.includes('incident_id "INC-2026-099" does not match any incident report id'),
      ),
    ).toBe(true);
  });
});
