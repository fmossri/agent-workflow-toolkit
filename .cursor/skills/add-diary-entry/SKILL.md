---
name: add-diary-entry
description: >-
  Creates a new agent diary or appends a well-formed chronological entry. Use when
  starting a diary session, recording agent learnings, writing a HANDOFF entry, or
  when the user mentions add-diary-entry or diary scaffolding.
---

# Add diary entry

Diaries follow `docs/agent-diaries/README.md`. There is **no diary index** — do not
create one.

## New diary (session start)

```bash
pnpm gen:diary-entry --create-diary \
  --file-stamp 2026-06-17-1600 \
  --timestamp "2026-06-17 16:00 (UTC-3)" \
  --summary "One-line session summary" \
  --keywords "topic-a,topic-b" \
  --entry-stamp "2026-06-17 16:05" \
  --subject "First entry subject" \
  --body "Definitive narrative — knowledge worth re-deriving, not a play-by-play."
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

## After generation

Run `pnpm doc-lint` to validate front-matter and heading rules.

## Discipline

Record **knowledge**, not a journal. Prefer definitive entries; wait until a topic
stabilizes before writing.
