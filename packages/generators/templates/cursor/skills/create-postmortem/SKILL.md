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

## Steps

1. Confirm the linked **incident report** (`INC-YYYY-NNN`) exists and is `resolved`.
2. **Search** `docs/postmortems/` for the current year’s highest `PM-YYYY-NNN`.
3. **Create** `docs/postmortems/PM-YYYY-NNN-short-slug.md` with `incident_id` set.
4. Run `pnpm doc-lint`.
5. Link the postmortem from the incident report and diary handoff.

## Template

```markdown
---
title: "PM-YYYY-NNN: <short title>"
type: postmortem
id: PM-YYYY-NNN
incident_id: INC-YYYY-NNN
status: published
summary: "<root cause + fix in one line>"
updated: YYYY-MM-DD
---

# PM-YYYY-NNN: <short title>

## Summary

## Timeline

| When | Event |
| ---- | ----- |

## Root cause

## Resolution

## Verification

## Prevention

## Links

- [INC-YYYY-NNN](../incident-reports/INC-YYYY-NNN-slug.md)
- PR: …
- Diary: …
```

## Discipline

- Blameless, precise, actionable prevention items.
- Set `status: draft` until the user approves; then `published`.
