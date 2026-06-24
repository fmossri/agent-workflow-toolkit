---
name: add-diary-entry
description: >-
  Creates a new agent diary or appends a well-formed chronological entry. Use when
  starting a diary session, recording agent learnings, writing a HANDOFF entry, or
  when the user mentions add-diary-entry or diary scaffolding.
---

# Add diary entry

Diaries follow `docs/agent-diaries/README.md` (ADR-0008). There is **no diary index**
— do not create one.

## New diary (session start)

```bash
pnpm gen:diary-entry --create-diary \
  --file-stamp 2026-06-17-1600 \
  --timestamp "2026-06-17 16:00 (UTC-3)" \
  --summary "One-line session summary" \
  --keywords "topic-a,topic-b" \
  --entry-stamp "2026-06-17 16:05" \
  --subject "First entry subject" \
  --body "Definitive narrative — alternatives weighed, gotcha noted, do-NOT for next session."
```

- **`--file-stamp`**: `YYYY-MM-DD-HHMM` for the filename.
- **`--keywords`**: comma-separated, max 5.

## Append to existing diary

```bash
pnpm gen:diary-entry \
  --diary docs/agent-diaries/agent-diary-2026-06-17-1600.md \
  --entry-stamp "2026-06-17 16:30" \
  --subject "Subject line" \
  --body "Entry body." \
  --handoff
```

Pass **`--handoff`** on the final entry when work continues in a later session
(heading suffix ` — HANDOFF`).

## Precious knowledge checklist

Lean does not mean empty. For non-obvious work (ADR, infra, integration), each
substantive entry should usually cover **at least two** of:

- **Alternatives** — options weighed and why one won (include rejected paths)
- **Gotchas** — tooling, runtime, import paths, Docker, API quirks
- **Governance / scope** — process surprises or owner-intent clarifications
- **Do-NOTs** — explicit constraints for the next session

## HANDOFF discipline

HANDOFF is a brief for continuity — **not** a substitute for diary depth. The latest
diary should be readable on its own.

HANDOFF may carry forward **owner-confirmed** decisions only. If the next session
needs an ADR, write **"first turn: present ADR proposal to owner"** — not
"implement ADR-NNNN."

## After generation

Run `pnpm doc-lint` to validate front-matter and heading rules.

## Discipline

Record **knowledge**, not a journal. Prefer definitive entries; wait until a topic
stabilizes before writing.
