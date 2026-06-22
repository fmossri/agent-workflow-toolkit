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

## Steps

1. **Search** `docs/incident-reports/` for the current year’s highest `INC-YYYY-NNN`
   sequence (grep `^id: INC-`).
2. **Create** `docs/incident-reports/INC-YYYY-NNN-short-slug.md` with valid
   front-matter (`type: incident-report`) and body sections from the README.
3. Set `status: open`, choose `severity` from impact, write **hypotheses only**
   (not conclusions).
4. Run `pnpm doc-lint`.
5. **Then** investigate — update `status` to `investigating` / `resolved` as you go.

## Template

```markdown
---
title: "INC-YYYY-NNN: <short title>"
type: incident-report
id: INC-YYYY-NNN
status: open
severity: medium
summary: "<one-line impact>"
updated: YYYY-MM-DD
backlog_ids: [BL-N]
---

# INC-YYYY-NNN: <short title>

## Reported

<user report, when, where seen — e.g. Metabase, logs>

## Impact

<rows affected, trust, blocked work>

## Initial observations

<queries, metrics, code pointers — evidence only>

## Hypotheses

1. …
2. …

## Links

- Diary: …
- PR: …
```

## Discipline

- Factual and timestamped; no fix details beyond containment.
- Link to the postmortem when one is written later (`PM-YYYY-NNN`).
