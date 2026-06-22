---
title: "Agent Workflow & Determinism"
type: spec
status: Draft
scope: "How agent behavior is standardized and constrained — schemas, generators/skills, rules, enforcement (linting/CI), and the one-agent-per-feature workflow — so output is predictable and as deterministic as practical."
motivated_by: [ADR-0004, ADR-0005, ADR-0003]
updated: {{DATE}}
---

# Spec: Agent Workflow & Determinism

This spec is the reference for adopting the portable agent workflow toolkit. Record binding
choices as ADRs during [kickstart](../kickstart.md).

## 1. Principle

LLM generation is stochastic. "Deterministic" here means **constraining the
output space and the workflow** so that, whatever path an agent takes, artifacts
conform to a fixed shape and the process passes fixed gates.

> Anything a convention can describe in prose, prefer to encode as a **generator**
> (so the agent doesn't hand-write it) or a **machine check** (so off-shape output
> is rejected).

## 2. The determinism ladder

| Layer               | What                            | Artifact(s)              |
| ------------------- | ------------------------------- | ------------------------ |
| 0 — Source of truth | One place per fact              | `docs/`, `AGENTS.md`     |
| 1 — Schemas         | Machine-readable artifact shape | JSON Schema / Zod        |
| 2 — Generators      | Deterministic scaffolders       | skills + scripts         |
| 3 — Rules           | File-scoped prose guardrails    | `.cursor/rules/*`        |
| 4 — Enforcement     | Reject off-shape output         | eslint/tsc/doc-linter/CI |
| 5 — Process         | Small, scoped contexts          | one-agent-per-feature    |

## 3. Toolchain

Typical baseline when the framework ships with enforcement (AF-5):

- **Repo shape:** monorepo via **pnpm workspaces** (adjust per project).
- **Language/build:** TypeScript `strict`; `tsc --noEmit` as the typecheck gate.
- **Lint:** ESLint v9 flat config + type-aware `typescript-eslint`.
- **Format:** Prettier (stylistic ESLint rules disabled).
- **Tests:** Vitest (TS/ESM-native).
- **Hooks/commits:** husky + lint-staged; commitlint + Conventional Commits.
- **Docs lint:** custom **doc-linter** validates front-matter schema, ISO dates,
  ADR-index sync, incident/postmortem id sync, relative links. Markdown **style**
  is Prettier's job.

## 4. Schemas

- **Code (runtime):** **Zod** for DTOs and boundary validation at project edges.
- **Docs (structure):** YAML front-matter on every doc, validated by JSON Schema.
  The `type` field selects which fields apply — see
  `node_modules/@agent-workflow/doc-linter/front-matter.schema.json`.

## 5. Rules (Cursor — optional)

Portable `.cursor/rules/*` point to docs as source of truth:

- `formatting.mdc`, `typescript.mdc`, `docs-and-diaries.mdc`
- `feature-workflow.mdc`, `kickstart.mdc`, `git-workflow.mdc`

**Non-Cursor agents:** read `AGENTS.md` and `docs/kickstart.md` — the same process
lives in the docs, not in tool config (ADR-0006).

Projects may add optional local rules for code conventions — not part of the portable scaffold.

## 6. Skills / generators

- **`scaffold-docs-structure`** — adds missing `docs/` + `AGENTS.md` (idempotent).
- **`create-adr`** — next-numbered ADR from template (+ index row).
- **`add-diary-entry`** — appends a well-formed diary entry.
- **`create-feature-spec`** — scope doc under `docs/specs/features/` (**doc only**).
- **`create-incident-report`** — next `INC-YYYY-NNN` incident report (**before** fixing).
- **`create-postmortem`** — post-incident write-up linked to an incident (**after** fix, with user permission).

### 6.1 Reusable cross-agent scaffold

Import via **degit** (wrapper 2) or **Cursor skill** (wrapper 1) — same templates,
same generator. See `docs/kickstart.md` § "How to import the framework".

**Kickstart:** phase A (structure adoption) + phase B (content bootstrap, user opt-in).

## 7. One-agent-per-feature workflow

Conventions in **`docs/specs/features/README.md`**.

- One backlog item → one feature spec → one branch → one PR.
- Acceptance criteria use **`gate:`**, **`structural:`**, **`behavior:`** prefixes.
- Structural criteria reference **this project's** architecture, not framework defaults.

## 8. Enforcement matrix

| Check              | Local (pre-commit) | CI (PR gate) |
| ------------------ | -------------------- | ------------ |
| Prettier format    | lint-staged          | ✓            |
| ESLint             | lint-staged          | ✓            |
| `tsc --noEmit`     | —                    | ✓            |
| Vitest             | —                    | ✓            |
| Conventional Commits | commit-msg         | ✓            |
| Docs/diary linter  | lint-staged (docs)   | ✓            |

CI is the merge authority. Protect `main` via branch policy or a pre-push hook.

The doc-linter fails on: invalid front-matter; non-ISO dates; wrong heading count;
broken relative links; ADR index drift; incident/postmortem id↔filename sync and
postmortem↔incident links. No diary or incident index — prior context via search.

## 9. Incident response workflow

When a user reports a bug or corrupt data:

1. **Incident report first** — run `pnpm gen:create-incident-report` (skill:
   `create-incident-report`) before code or data fixes.
2. **Investigate and fix** — update incident `status` (`open` → `investigating` →
   `resolved`).
3. **Postmortem after fix** — ask the user for permission, then run
   `pnpm gen:create-postmortem` (skill: `create-postmortem`).

No index tables for incidents or postmortems — search by `INC-` / `PM-` id or slug.
Front-matter types `incident-report` and `postmortem` are validated by the doc-linter
schema (AF-7).
