---
name: create-incident-report
description: >-
  Creates a new incident report under docs/incident-reports/ when a user reports a
  bug or data/production issue. Use at the START of incident response — before fixing.
---

# Create incident report

**Mandatory first step** when a user reports an incident or bug. Do not patch code
or mutate data until the report exists (unless the user explicitly requests emergency
containment first).

Rules: `docs/incident-reports/README.md`.

## Run the generator

From the **consumer project** root (requires `@agent-workflow/generators` installed):

```bash
pnpm gen:create-incident-report \
  --title "Short title" \
  --summary "One-line impact statement" \
  --slug optional-kebab-slug \
  --severity medium \
  --status open \
  --backlog-id PROJ-1
```

- **`--slug`** defaults to a kebab-case slug derived from `--title`.
- **`--severity`**: `low`, `medium` (default), `high`, or `critical`.
- **`--status`**: `open` (default), `investigating`, or `resolved`.
- **`--backlog-id`**: optional backlog reference.
- **`--year`**: defaults to the current year; sequence `INC-YYYY-NNN` auto-increments per year.

The generator assigns the next `INC-YYYY-NNN` id and writes the scaffold under
`docs/incident-reports/`.

## After generation

1. Fill **Reported**, **Impact**, **Initial observations**, and **Hypotheses** (evidence
   only — no conclusions yet).
2. Run `pnpm doc-lint` — validates front-matter and id↔filename sync.
3. **Then** investigate — update `status` to `investigating` / `resolved` as you go.

## Discipline

- Factual and timestamped; no fix details beyond containment.
- Link to the postmortem when one is written later (`PM-YYYY-NNN`).
