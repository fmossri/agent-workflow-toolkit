---
title: "Postmortems"
type: index
updated: {{DATE}}
---

# Postmortems

A **postmortem** is written **after** an incident is fixed. It records root cause,
timeline, remediation, and prevention — knowledge worth preserving.

## When to create one

After fixing a bug tied to an incident report, the agent **must ask the user for
permission**, then write a postmortem if approved.

Use the **`create-postmortem`** skill (`.cursor/skills/create-postmortem/`).

Run `pnpm gen:create-postmortem --incident-id INC-YYYY-NNN --title "…" --summary "…"` —
do not hand-number `PM-YYYY-NNN` ids.

## File naming

`PM-YYYY-NNN-short-slug.md` — matches the incident sequence where possible (e.g.
`PM-2026-001-maps-spike-stale-panel.md` for `INC-2026-001`).

No index table — find via search.

## Front-matter

```yaml
---
title: "PM-YYYY-NNN: <short title>"
type: postmortem
id: PM-YYYY-NNN
incident_id: INC-YYYY-NNN
status: draft | published
summary: "<one-line root cause + fix>"
updated: YYYY-MM-DD
---
```

## Body sections

1. **Summary** — one paragraph
2. **Timeline** — report → diagnose → fix → verify
3. **Root cause** — definitive explanation
4. **Resolution** — code/data changes
5. **Verification** — how we know it's fixed
6. **Prevention** — tests, guards, process changes
7. **Links** — incident report, PR, diary

Set `status: published` when the owner accepts the write-up.
