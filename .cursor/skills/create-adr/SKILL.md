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

## Step 0 — Owner participation (required)

Do **not** run `pnpm gen:create-adr` until the owner has confirmed the direction
in this session (or a HANDOFF explicitly says **"direction approved:"** with the
decision stated). If direction is not confirmed yet, present context, alternatives,
pros/cons, and a recommendation, then wait. Full rule: `docs/adr/README.md`.

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
- **`--status`**: default **`Proposed`**. Only use `Accepted` if the owner
  explicitly requests it in chat — merge is the normal acceptance gate.
- **`--date`**: defaults to today (ISO `YYYY-MM-DD`).

Same-session **Proposed ADR + implementation** is fine after Step 0 passes.

## After generation

1. Fill in **Context**, **Decision**, **Alternatives considered**, and **Consequences**
   (reflect the discussion the owner participated in).
2. Run `pnpm doc-lint` — it validates front-matter and index↔file sync.
3. Run `pnpm format` when Prettier is wired.

## Rules

- Do not edit an `Accepted` ADR to reverse a decision — recommend a new ADR to supersede it.
- Process and participation gate: `docs/adr/README.md`.
