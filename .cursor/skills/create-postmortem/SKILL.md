---
name: create-postmortem
description: >-
  Creates a postmortem under docs/postmortems/ after an incident is fixed. Use only
  after asking the user for permission to write it.
---

# Create postmortem

Write **after** the incident is fixed and verified. **Ask the user for permission
first** — do not write unbidden.

Rules: `docs/postmortems/README.md`.

## Run the generator

From the **consumer project** root (requires `@agent-workflow/generators` installed):

```bash
pnpm gen:create-postmortem \
  --incident-id INC-2026-001 \
  --title "Short title" \
  --summary "Root cause + fix in one line" \
  --slug optional-kebab-slug \
  --status draft
```

- **`--incident-id`**: required — must match an existing incident report (`INC-YYYY-NNN`).
- **`--slug`** defaults to a kebab-case slug derived from `--title`.
- **`--status`**: `draft` (default) or `published`.
- Sequence `PM-YYYY-NNN` matches the incident number when available; otherwise auto-increments.

Confirm the linked incident report exists and is `resolved` before running (the CLI
warns if status is not `resolved`; pass `--allow-open-incident` to skip the warning).

## After generation

1. Fill **Summary**, **Timeline**, **Root cause**, **Resolution**, **Verification**,
   and **Prevention**.
2. Run `pnpm doc-lint` — validates front-matter, id↔filename sync, and `incident_id` link.
3. Link the postmortem from the incident report and diary handoff.
4. Set `status: published` when the owner accepts the write-up.

## Discipline

- Blameless, precise, actionable prevention items.
