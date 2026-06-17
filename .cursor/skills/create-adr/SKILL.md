---
name: create-adr
description: >-
  Creates the next-numbered Architecture Decision Record from the repo template and
  inserts an index row in docs/adr/README.md. Use when adding an ADR, recording an
  architectural decision, or when the user mentions create-adr or ADR scaffolding.
---

# Create ADR

Do not hand-number ADRs or edit the index manually — run the generator so the
doc-linter's ADR-index sync check passes.

## Run the generator

From the **consumer project** root (requires `@agent-workflow/generators` installed):

```bash
pnpm gen:create-adr \
  --title "Short decision title" \
  --slug optional-kebab-slug \
  --status Proposed \
  --deciders "Project owner, agent"
```

- **`--slug`** defaults to a kebab-case slug derived from `--title`.
- **`--status`**: `Proposed` (default), `Accepted`, `Superseded`, or `Deprecated`.
- **`--date`**: defaults to today (ISO `YYYY-MM-DD`).

## After generation

1. Fill in **Context**, **Decision**, **Alternatives considered**, and **Consequences**.
2. Run `pnpm doc-lint` — it validates front-matter and index↔file sync.
3. Run `pnpm format`.

## Rules

- Never edit an `Accepted` ADR to reverse a decision — supersede it with a new ADR.
- Process and template reference: `docs/adr/README.md`.
