---
title: "Project kickstart"
type: guide
status: living
updated: {{DATE}}
---

# Project kickstart

Two **separate** phases when adopting the portable agent framework (ADR-0006). Neither
phase overwrites existing project docs by default.

| Phase | Tool | What it does | Overwrites? |
| ----- | ---- | ------------ | ----------- |
| **A — Structure adoption** | `scaffold-docs-structure` | Adds missing `AGENTS.md`, `docs/*` framework files | **No** — skips existing paths (`--force` opt-in only) |
| **B — Content bootstrap** | Agent-facilitated kickstart | Fills requirements, architecture, backlog, ADRs, TODO | **No** — merges/drafts content; user approves |

After both phases, use [feature specs](specs/features/README.md) and one backlog item
per session (ADR-0005).

## How to import the framework

Install **`@agent-workflow/generators`** and **`@agent-workflow/doc-linter`** as
devDependencies (templates stay in `node_modules` — not copied into your repo). Wire
root `gen:*` and `doc-lint` scripts per the framework README, then:

```bash
pnpm gen:scaffold-docs --target . \
  --project-name "My App" \
  --project-description "One-line description."
```

The generator reads templates from the installed generators package and writes into
`--target` only. Idempotent — skips existing paths unless `--force`.

## Agent workflow (first session)

Works for **any agent** (Cursor, Claude Code, opencode, …). Cursor users also get
`.cursor/rules/kickstart.mdc`; everyone else follows this doc and `AGENTS.md`.

1. **Confirm** the working directory is the project root.
2. **Inspect** which framework files exist vs are missing.
3. **Ask the user:**
   - Run **structure adoption** (`scaffold-docs-structure`) for missing files?
   - Run **content bootstrap** (below) if placeholders remain?

## When to offer content bootstrap

When `docs/requirements.md` and `docs/backlog.md` still match scaffold placeholders
(see sentinel strings in those templates). If real docs already exist, kickstart **merges**
content — never wholesale replace.

## Content bootstrap sequence

| Step | Phase | Deliverable |
| ---- | ----- | ----------- |
| 1 | Requirements elicitation | Diary capture |
| 2 | Requirements specification | [`requirements.md`](requirements.md) |
| 3 | Architecture / system design | [`architecture.md`](architecture.md) |
| 4 | Decision records | ADRs |
| 5 | Backlog decomposition | [`backlog.md`](backlog.md) |
| 6 | Working slice | [`TODO.md`](TODO.md) |
| 7 | Handoff | Diary ` — HANDOFF` |
