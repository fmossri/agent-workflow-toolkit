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
| **B — Content bootstrap**  | Agent-facilitated kickstart | Owner interview → requirements, architecture, backlog, ADRs, TODO | **No** — merges/drafts; user approves            |

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
| 1    | Requirements elicitation         | Owner interview (diary capture)      |
| 2    | Requirements specification       | [`requirements.md`](requirements.md) |
| 3    | Architecture / system design     | [`architecture.md`](architecture.md) |
| 4    | Decision records                 | ADRs                                 |
| 5    | Backlog decomposition          | [`backlog.md`](backlog.md)           |
| 6    | Working slice                    | [`TODO.md`](TODO.md)                 |
| 7    | Handoff                          | Diary ` — HANDOFF`                   |

### Step 1 — Requirements elicitation (owner interview)

**Goal:** produce enough detail to write a professional-grade [`requirements.md`](requirements.md).
This is a **structured interview with the owner** — not a solo agent draft.

**Rules for the agent:**

- **Ask; do not assume.** Every requirement must trace to something the owner said
  or explicitly confirmed.
- **One topic at a time** (or a small related cluster). Use follow-up questions until
  each answer is concrete and testable.
- **Capture in your diary** as you go — decisions, quotes, unresolved points. Synthesize
  into `requirements.md` only after the interview pass is complete.
- **Stop and confirm** when scope feels ambiguous; offer options with trade-offs rather
  than filling gaps yourself.
- **Owner approval gate:** present a draft `requirements.md` summary and get explicit
  approval before moving to architecture (step 3).

**Interview outline** — work through in order; skip only what the owner says is N/A:

1. **Vision & problem**
   - What problem does this project solve? For whom?
   - One-sentence MVP vs longer-term vision?
   - What does success look like in 3 months? In a year?

2. **Users & stakeholders**
   - Who uses the system (roles, count, technical level)?
   - Who decides priorities? Who must approve releases?

3. **MVP boundaries**
   - What must ship in the first usable version? (bullet list)
   - What is explicitly **out of scope** for now?
   - What is **deferred** — likely needs an ADR later (auth, deployment, integrations)?

4. **Functional capabilities** (user journeys)
   - Walk through the primary flows end-to-end (happy path + key edge cases).
   - For each capability: inputs, outputs, and how the user verifies it works.
   - Number these as **FR1, FR2, …** — each row must be independently testable.

5. **Non-functional requirements**
   - Performance, freshness, scale (users, data volume, request rate).
   - Reliability, resilience, and acceptable degradation.
   - Security, privacy, compliance (if any).
   - Observability, operability, and support expectations.
   - Evolvability constraints (e.g. single-user MVP that must not block multi-tenancy).
   - Number these as **NFR1, NFR2, …**.

6. **Assumptions & constraints**
   - External dependencies (APIs, vendors, platforms) and their known limits.
   - Team, timeline, budget, or technology constraints.
   - What is treated as fixed vs negotiable?

7. **Open questions**
   - What is still unknown? What needs an ADR before implementation can proceed?
   - Capture here; do **not** silently decide during elicitation.

**Example depth:** see a populated [`requirements.md`](requirements.md) in a mature
project — vision with MVP/future split, scoped in/out/deferred lists, numbered FR/NFR
tables, assumptions, and open questions linked to ADRs/backlog.

### Step 2 — Requirements specification

Draft [`requirements.md`](requirements.md) from the interview using the scaffold
structure:

- §1 Vision (include **MVP** and **Future** bullets)
- §2 Scope (**In scope**, **Out of scope**, **Explicitly deferred**)
- §3 Functional requirements (FR table — no empty rows)
- §4 Non-functional requirements (NFR table)
- §5 Assumptions & constraints
- §6 Open questions (with pointer to ADR/backlog resolution)

Run `pnpm doc-lint` after editing. **Get owner sign-off** on the document before
step 3.

### Step 3 — Architecture / system design

Draft [`architecture.md`](architecture.md) from the **approved** [`requirements.md`](requirements.md).

- **Overview** — high-level system shape (clients, services, data stores, external APIs).
- **Components** — list each major piece and its responsibility; link to ADRs where a
  choice is already recorded.
- **Data model** — core entities and relationships (sketch is fine at kickstart).
- **Deployment** — how the system runs in dev and production (or mark as open if deferred).

Use follow-up questions with the owner for stack, boundaries, and integration points
that requirements alone do not settle. **Owner approval gate** before ADRs and backlog.

Run `pnpm doc-lint` after editing.

### Step 4 — Decision records (ADRs)

For each **open question** or **explicitly deferred** item in `requirements.md` that
blocks or shapes implementation, follow the **owner participation workflow** in
`docs/adr/README.md`:

1. Present context, alternatives, and a recommendation in chat.
2. **Wait for owner participation** before running `pnpm gen:create-adr`.
3. Record the agreed direction as **`Proposed`**; implement consequences in the same
   session if scoped.
4. Owner sets **`Accepted`** at merge.

Do not treat backlog notes, architecture "proposed" sections, or HANDOFF text as
permission to decide alone. Link ADRs from `requirements.md` §6 and `architecture.md`
as decisions land.

### Step 5 — Backlog decomposition

Populate [`backlog.md`](backlog.md) by breaking approved requirements and architecture
into **milestones** and **stable IDs** (e.g. `M0-1`, `M1-6`):

- **Milestone 0 — Foundations** — tooling, repo shape, kickstart docs, blocking ADRs.
- **Later milestones** — group work by user-visible capability or vertical slice.
- Each row: ID, item description, status (`todo` initially), notes (FR/NFR refs, ADR links).

IDs must stay stable — diary, TODO, commits, and feature specs reference them.
**Owner approval gate** on milestone ordering and first slice of work.

### Step 6 — Working slice (TODO)

Copy the **first actionable items** from `backlog.md` into [`TODO.md`](TODO.md) —
the session's volatile working set. Keep backlog durable; never delete from it.

Mark backlog items `in-progress` / `completed` only when matching TODO work closes.

### Step 7 — Handoff

Close your diary with a ` — HANDOFF` entry summarizing what was elicited, what docs
were drafted, which ADRs are proposed vs accepted, and the recommended next session
(first backlog item + any blocking decisions).

Each major artifact follows the same pattern: **elicit → draft → owner approval → next step.**
Phase B is not complete until `requirements.md`, `architecture.md`, `backlog.md`, and
at least a starter `TODO.md` are populated (ADRs as needed for open decisions).

## Related

- [`specs/agent-workflow.md`](specs/agent-workflow.md) §6.1 (AF-9)
- Toolkit: [github.com/fmossri/agent-workflow-toolkit](https://github.com/fmossri/agent-workflow-toolkit)
