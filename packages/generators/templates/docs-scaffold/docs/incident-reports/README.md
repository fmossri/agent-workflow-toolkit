---
title: "Incident Reports"
type: index
updated: {{DATE}}
---

# Incident Reports

An **incident report** records a user-reported bug or production/data issue **at
investigation start** — before the fix. It is the triage artifact: symptoms, impact,
and initial hypotheses.

## When to create one

When a user reports an incident or bug, the agent **must create an incident report
as the first action** — before changing code or data (except emergency containment
the user explicitly requests).

Use the **`create-incident-report`** skill (`.cursor/skills/create-incident-report/`).

Run `pnpm gen:create-incident-report --title "…" --summary "…"` — do not hand-number
`INC-YYYY-NNN` ids.

## File naming

`INC-YYYY-NNN-short-slug.md` — zero-padded sequence per year (e.g.
`INC-2026-001-maps-spike-stale-panel.md`).

There is **no index table** — find prior reports by search (`grep` / semantic search).

## Front-matter

```yaml
---
title: "INC-YYYY-NNN: <short title>"
type: incident-report
id: INC-YYYY-NNN
status: open | investigating | resolved
severity: low | medium | high | critical
summary: "<one-line impact statement>"
updated: YYYY-MM-DD
backlog_ids: [BL-N] # optional
---
```

## Body sections

1. **Reported** — who/when, user-visible symptoms
2. **Impact** — data, users, scope
3. **Initial observations** — evidence (queries, logs, screenshots described)
4. **Hypotheses** — ranked guesses (not conclusions)
5. **Links** — diary, PR, related ADRs

Update `status` as investigation progresses. When resolved, link the postmortem.
