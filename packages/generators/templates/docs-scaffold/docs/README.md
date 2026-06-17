---
title: "Documentation"
type: index
updated: {{DATE}}
---

# Documentation

This folder is the project's memory. Start at the repo root [`AGENTS.md`](../AGENTS.md)
for the reading order.

## Structure

```
docs/
├── README.md            ← you are here
├── kickstart.md         ← greenfield content bootstrap (AF-9)
├── adr/                 ← Architecture Decision Records (binding decisions)
│   └── README.md        ← ADR index + how to write one
├── agent-diaries/       ← per-agent diaries (working memory)
│   └── README.md        ← diary rules
├── requirements.md      ← functional + non-functional requirements, scope
├── specs/               ← cross-cutting specifications
│   └── README.md        ← spec index + when to create a new spec
├── architecture.md      ← system design & architecture
├── backlog.md           ← the full backlog
└── TODO.md              ← today's working set
```

## Conventions

- **Every doc starts with YAML front-matter.** Machine-checked when the doc-linter
  is wired in; see `docs/specs/agent-workflow.md` §4 when present.
- Prefer linking over duplicating. One source of truth per fact.
- Dates use ISO format (`YYYY-MM-DD`).

## Cursor integration

When using Cursor, `.cursor/rules/*.mdc` and `.cursor/skills/*/SKILL.md` are scaffolded
by **`gen:scaffold-docs`** (automatic inside Cursor; `--with-cursor` otherwise). They
point to ADR/spec sources of truth — they do not replace this documentation. Projects
may add optional local rules (e.g. code-layout conventions) after architecture is decided.
