---
title: "Agent Diaries"
type: index
updated: {{DATE}}
---

# Agent Diaries

This directory holds **one diary per agent session**. Diaries are the project's
accumulated working memory: how decisions were reached, what was tried, and what
a future agent needs to know. Unlike ADRs (which record _the_ decision), diaries
record the _journey and context_.

The discipline here is intentionally **lean** (ADR-0008): no play-by-play, no edit
logs. There is **no index and no keyword vocabulary** — prior context is found by
**search**.

**Raise the bar:** lean does not mean empty. Every session with non-obvious work
should leave **precious knowledge** a cold-start agent would otherwise grep or
re-derive — alternatives weighed, gotchas, governance surprises, explicit do-NOTs.
The HANDOFF is a brief for continuity; it is **not** a substitute for diary depth.
The latest diary should be readable on its own, not only via HANDOFF.

## How to find prior context

You don't need to read every diary, but you **do** read the latest one. In order:

1. Read the **most recent diary in full** — it is a single bounded file holding the
   freshest accumulated knowledge: gotchas, dead ends, and trade-offs that may not
   all be distilled into the handoff. Its final entry, if it ends with ` — HANDOFF`,
   is your starting brief (see Handoffs). Don't rely on the handoff alone to have
   surfaced every relevant detail.
2. **Search** the older `docs/agent-diaries/**` with grep/semantic search for the
   subject, file, or symbol you care about, and open only the entries that match.

## How to make your diary

- **One diary per agent/session.** Do **not** edit another agent's diary (unless
  the owner asks for a cross-cutting migration).
- **File name:** `agent-diary-<timestamp>.md`, where `<timestamp>` is the session
  start time down to minutes, format `YYYY-MM-DD-HHMM` (local time, note the zone
  in the header). Example: `agent-diary-2026-06-16-1803.md`.
- **Structure:** a single header, followed by chronological entries.
- Use the **`add-diary-entry` generator** (skill: `add-diary-entry`) for
  well-formed headers and entries.

### Header

Each diary starts with YAML **front-matter** (machine-checkable), then an `# H1`
title:

```
---
title: "Agent Diary — <timestamp>"
type: diary
timestamp: "YYYY-MM-DD HH:MM (TZ)"
summary: "<one line: what this session was about>"
keywords: [<up to 5 free-text headline topics>]
---

# Agent Diary — <timestamp>
```

The `summary` plus up to **5** `keywords` are a human TL;DR. Keep them tight and
reflect substantive entries (the "raise the bar" rule below), not every micro-action.
There is **no `files` list**: use `git log --stat` or `git log -- <path>` to see
what a session changed.

### Entries

```
## <timestamp> — <short subject>

<definitive narrative>
```

- Newest entries at the **bottom** (chronological).
- A handoff entry's heading is suffixed ` — HANDOFF` (see below).
- Write plain prose; reference files by their real path and decisions by their ADR.

### What makes a good entry

- **Record knowledge, not a journal.** Capture what a future agent would otherwise
  pay to rediscover — an API quirk, a dead end, a non-obvious trade-off, a
  rationale too small for an ADR. **Don't** log routine play-by-play ("synced these
  docs").
- **Be relevant and, preferably, definitive.** Capture settled outcomes, not live
  debate:
  > "We weighed A vs B. I proposed x and y; the owner noted z; we decided B."
- **Avoid entries that the next entry contradicts.** If there is a lot of
  back-and-forth, **wait** — don't write the entry until it stabilizes.
- Prefer linking to ADRs/specs for the formal record; the diary explains the
  _why/how_ around them.

### Precious knowledge checklist

For sessions with non-obvious work (ADR, infra, integration, debugging), a
substantive entry should usually touch **at least two** of:

- **Alternatives** — options weighed and why one won (include rejected paths).
- **Gotchas** — tooling, runtime, import paths, Docker, API quirks, etc.
- **Governance / scope** — surprises about process, boundaries, or owner intent.
- **Do-NOTs** — explicit constraints for the next session.

Two short entries that each hit two checklist items beat one HANDOFF-sized stub.

## Handoffs (read first, write last)

The diary is how the baton passes between sessions. A **handoff** is the final
entry of a session's diary, used when work will continue later.

- **At the start of a session:** read the **most recent diary's final entry**. If
  its heading ends with ` — HANDOFF`, that is your starting brief — read it before
  planning. It states the next feature, **owner-confirmed** decisions to carry
  forward, acceptance criteria, constraints/do-NOTs, and the suggested git branch.
- **At the end of a session:** if a clear next workstream remains, close your
  diary with a **HANDOFF entry** — heading suffixed ` — HANDOFF` — containing:
  next feature/scope, owner-confirmed decisions to carry forward, acceptance
  criteria, do-NOTs/constraints, and the suggested branch.

**HANDOFF may carry forward owner-confirmed decisions only.** If the next session
requires an ADR, write **"first turn: present ADR proposal to owner"** — not
"implement ADR-NNNN." Backlog notes and architecture "proposed" sections are
context, not permission to decide alone.

A session may legitimately have **no** handoff (e.g. the work is fully done).
