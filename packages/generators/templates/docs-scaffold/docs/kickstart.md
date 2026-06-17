---
title: "Project kickstart"
type: guide
status: living
updated: {{DATE}}
---

# Project kickstart

Two **separate** phases when adopting the agent workflow toolkit (ADR-0006). Neither
phase overwrites existing project docs by default.

| Phase                      | Tool                      | What it does                                          | Overwrites?                                      |
| -------------------------- | ------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| **A — Structure adoption** | `scaffold-docs-structure` | Adds missing `AGENTS.md`, `docs/*`, wires `gen:*` scripts; in **Cursor**, also `.cursor/rules` + `.cursor/skills` | **No** — skips existing paths (`--force` opt-in) |
| **B — Content bootstrap**  | Agent-facilitated kickstart | Fills requirements, architecture, backlog, ADRs, TODO | **No** — merges/drafts; user approves            |

After both phases, use [feature specs](specs/features/README.md) and one backlog item
per session (ADR-0005).

## Install (once per project)

```bash
pnpm add -D \
  "github:fmossri/agent-workflow-toolkit#path:packages/generators" \
  "github:fmossri/agent-workflow-toolkit#path:packages/doc-linter" \
  tsx
```

Templates and Cursor scaffolds live in `node_modules` — they are **not** copied into
your repo as a `templates/` tree.

## Phase A — one command

**First run** (before `gen:scaffold-docs` exists in `package.json`):

```bash
pnpm exec tsx node_modules/@agent-workflow/generators/src/scaffold-docs-structure.ts \
  --target . \
  --project-name "My App" \
  --project-description "One-line description."
```

This command:

1. Scaffolds missing **`AGENTS.md`** and **`docs/*`** workflow files.
2. Merges missing **`gen:*`** and **`doc-lint`** scripts into root **`package.json`**.
3. **In Cursor** (auto-detected): scaffolds **`.cursor/rules/`** and **`.cursor/skills/`**.
   Outside Cursor, pass **`--with-cursor`** to add them; **`--no-cursor`** to skip in Cursor.

Subsequent runs (after scripts are wired):

```bash
pnpm gen:scaffold-docs --target . \
  --project-name "My App" \
  --project-description "One-line description."
```

Idempotent — skips existing paths unless **`--force`**.

## Agent workflow (first session)

Works for **any agent** (Cursor, Claude Code, opencode, …).

1. **Confirm** the working directory is the project root.
2. **Inspect** which framework files exist vs are missing.
3. **Ask the user:**
   - Run **structure adoption** (command above) for missing files?
   - Run **content bootstrap** (below) if placeholders remain?

**Cursor agents:** when initializing the toolkit, run phase A **with Cursor integration**
(default in Cursor — do not skip `.cursor/` unless the user says `--no-cursor`).

## When to offer content bootstrap

When `docs/requirements.md` and `docs/backlog.md` still match scaffold placeholders
(see sentinel strings in those templates). If real docs already exist, kickstart **merges**
content — never wholesale replace.

## Content bootstrap sequence

| Step | Phase                            | Deliverable                          |
| ---- | -------------------------------- | ------------------------------------ |
| 1    | Requirements elicitation         | Diary capture                        |
| 2    | Requirements specification       | [`requirements.md`](requirements.md) |
| 3    | Architecture / system design     | [`architecture.md`](architecture.md) |
| 4    | Decision records                 | ADRs                                 |
| 5    | Backlog decomposition          | [`backlog.md`](backlog.md)           |
| 6    | Working slice                    | [`TODO.md`](TODO.md)                 |
| 7    | Handoff                          | Diary ` — HANDOFF`                   |

## Related

- [`specs/agent-workflow.md`](specs/agent-workflow.md) §6.1 (AF-9)
- Toolkit: [github.com/fmossri/agent-workflow-toolkit](https://github.com/fmossri/agent-workflow-toolkit)
