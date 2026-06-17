---
title: "Agent Diaries"
type: index
updated: {{DATE}}
---

# Agent Diaries

One diary per agent session. Diaries are working memory — unlike ADRs (which record
_the_ decision), diaries record the _journey and context_.

There is **no index** — prior context is found by **search** (ADR-0008).

## How to find prior context

1. Read the **most recent diary in full** — its final ` — HANDOFF` entry, if any,
   is your starting brief.
2. **Search** older `docs/agent-diaries/**` for the subject you care about.

## How to make your diary

- **File name:** `agent-diary-<YYYY-MM-DD-HHMM>.md` (local time; note zone in header).
- **Structure:** YAML front-matter + `#` title, then chronological entries (newest at bottom).
- Use the **`add-diary-entry` generator** (AF-4) for well-formed headers and entries.

See the full rules in a mature project's `docs/agent-diaries/README.md` or the agent
framework spec §4 (`diary` front-matter fields).
