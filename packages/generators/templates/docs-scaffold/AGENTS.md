---
title: "AGENTS.md"
type: guide
status: living
updated: {{DATE}}
---

# AGENTS.md

Entry point for any AI agent (or human) working in this repository. **Read this first.**

## What this project is

**{{PROJECT_NAME}}** — {{PROJECT_DESCRIPTION}}

## Before you do anything

1. Read the **decision log**: [`docs/adr/`](docs/adr/README.md). These are the
   binding decisions. Do not contradict an `Accepted` ADR; if you think one is
   wrong, propose a new ADR that supersedes it.
2. **Start your own diary** under [`docs/agent-diaries/`](docs/agent-diaries/README.md).
   Each agent/session keeps its own diary file; read that directory's `README.md`
   for the rules. **Don't read every diary** (it doesn't scale), but **do read the
   most recent diary in full** — it is one bounded file holding the freshest
   knowledge (gotchas, dead ends) that may not all be folded into the handoff; its
   final entry, if suffixed ` — HANDOFF`, is your starting brief. Then use
   grep/semantic search over the older `docs/agent-diaries/**` for any specific
   prior context you need (ADR-0008).
3. **Adopting the toolkit (new or in-progress repo).** Confirm you are in the
   **project root**. Inspect which framework files exist. **Ask the user:**
   - **Structure adoption?** — run `pnpm gen:scaffold-docs` (or the bootstrap
     command in `docs/kickstart.md` before scripts are wired). Adds missing
     `AGENTS.md`, `docs/*`, and `gen:*` scripts; **in Cursor**, also `.cursor/`
     (automatic — use `--no-cursor` only if the user declines).
   - **Content bootstrap?** — if placeholders remain, offer kickstart per
     [`docs/kickstart.md`](docs/kickstart.md) (phase B; user opt-in; merge — do not
     replace existing real docs).
4. Check the current work: [`docs/TODO.md`](docs/TODO.md) (today's working set)
   and [`docs/backlog.md`](docs/backlog.md) (the full backlog).
5. **Incident reported?** If the user reports a bug or bad data, **create an incident
   report first** ([`docs/incident-reports/`](docs/incident-reports/README.md),
   skill: `create-incident-report`) — before fixing. After the fix is verified,
   **ask the user for permission**, then write a postmortem ([`docs/postmortems/`](docs/postmortems/README.md),
   skill: `create-postmortem`).
6. **One feature per session** (after kickstart). Scope work with
   `pnpm gen:create-feature-spec`; see [`docs/specs/features/README.md`](docs/specs/features/README.md).

## While you work

- **Write entries in your own diary** (in [`docs/agent-diaries/`](docs/agent-diaries/README.md))
  whenever you learn something a future agent would want to know. Record **knowledge
  worth re-deriving, not a play-by-play** of what you edited.
- **End with a handoff.** If a clear next workstream remains at session end, close
  your diary with a ` — HANDOFF` entry so the next agent can start cold.
- **Record real decisions as ADRs.** Use the `create-adr` generator or follow
  [`docs/adr/README.md`](docs/adr/README.md).
- **Propose new specs proactively.** When a subject becomes concrete enough to
  deserve its own document, create it under [`docs/specs/`](docs/specs/README.md).
- **Propose pattern promotion (owner gate).** When the same **code shape** repeats
  (~3× or clearly stabilizing), **tell the user once** and ask whether to promote it
  to a project pattern (generator under `tools/<project>/` + lint/boundaries/tests +
  optional `.cursor/rules/*`). Do **not** record, scaffold, or add enforcement without
  approval. Process: [`docs/specs/agent-workflow.md`](docs/specs/agent-workflow.md) §8
  when present; `.cursor/rules/pattern-promotion.mdc` when scaffolded.
- **Keep TODO and backlog in sync.** Copy backlog items into `docs/TODO.md`; mark
  a backlog item `completed` only when its TODO work closes it.

## Documentation map

| Document                                              | Purpose                                              |
| ----------------------------------------------------- | ---------------------------------------------------- |
| [`docs/README.md`](docs/README.md)                    | How the documentation is organized                   |
| [`docs/kickstart.md`](docs/kickstart.md)              | Greenfield content bootstrap (AF-9)                  |
| [`docs/adr/`](docs/adr/README.md)                     | Architecture Decision Records (binding decisions)    |
| [`docs/agent-diaries/`](docs/agent-diaries/README.md) | Per-agent diaries (working memory; found via search) |
| [`docs/incident-reports/`](docs/incident-reports/README.md) | Bug/data incidents — write **before** fixing |
| [`docs/postmortems/`](docs/postmortems/README.md) | Post-incident write-ups — **after** fix, with permission |
| [`docs/requirements.md`](docs/requirements.md)        | Requirements + scope                                 |
| [`docs/specs/`](docs/specs/README.md)                 | Cross-cutting specs                                  |
| [`docs/specs/features/`](docs/specs/features/README.md) | Per-feature session specs                          |
| [`docs/architecture.md`](docs/architecture.md)        | System design & architecture                         |
| [`docs/backlog.md`](docs/backlog.md)                  | Central backlog                                      |
| [`docs/TODO.md`](docs/TODO.md)                        | Daily working TODO                                   |
