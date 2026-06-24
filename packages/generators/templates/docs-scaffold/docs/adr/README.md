---
title: "Architecture Decision Records (ADRs)"
type: index
updated: {{DATE}}
---

# Architecture Decision Records (ADRs)

An ADR captures a single significant decision: the context, the choice, and the
consequences. ADRs are **binding** once `Accepted` — treat an `Accepted` ADR as
settled unless a newer ADR supersedes it.

## Owner participation (before you write)

For ADR-worthy decisions, **do not choose among alternatives on your own**. Backlog
notes, architecture "proposed" sections, and prior HANDOFFs are **context**, not
permission to decide.

Two gates — do not confuse them:

| Gate | Question | Who |
| ---- | -------- | --- |
| **Participation** | Which direction do we take? | Owner participates **before** the ADR file and binding edits |
| **Status** | When is it binding org-wide? | Owner sets `Accepted` (merge or explicit in-chat) |

**Participation workflow** (required):

1. **Present** context, alternatives, pros/cons, and a recommendation in chat (or
   structured questions).
2. **Wait for owner participation** — confirm, adjust, or pick an option.
3. **Record** the agreed direction as an ADR with status **`Proposed`** (`pnpm gen:create-adr`).
4. **Implement** consequences in the same session if scoped — same-session Proposed +
   implementation is fine **after** step 2.
5. Owner sets **`Accepted`** at merge (or explicit in-chat acceptance; merge is the
   durable gate).

`Proposed` means not yet binding org-wide. It does **not** mean the agent may decide
alone and ask forgiveness at PR review.

**Non-goals:** Do not require `Accepted` before implementation or split ADR sessions
by default. The failure mode is deciding **without the owner in the loop**, not
implementing before merge.

## Index

| #   | Title | Status |
| --- | ----- | ------ |

## How to add an ADR

Use the **`create-adr` skill** — it encodes the participation gate. Summary:

1. **Step 0:** Owner confirms direction in this session (see participation workflow
   above). Do not run the generator until then.
2. Run `pnpm gen:create-adr` with `--status Proposed` (default).
3. Fill **Context**, **Decision**, **Alternatives considered**, and **Consequences**.
4. Add nothing manually to the index — the generator inserts the row.
5. Run `pnpm doc-lint`.
6. Never edit the substance of an `Accepted` ADR to reverse it — supersede it with
   a new ADR.

Only the owner sets `Accepted`. Agents do not set `Accepted` unless the owner
explicitly requests it in chat.

## Template

Every ADR starts with YAML **front-matter** (machine-checkable), then the body.

```markdown
---
id: ADR-NNNN
title: "<title>"
type: adr
status: Proposed | Accepted | Superseded | Deprecated
date: YYYY-MM-DD
deciders: [<who>]
supersedes: null
superseded_by: null
---

# ADR-NNNN: <title>

## Context

What is the situation and the forces at play?

## Decision

What did we decide to do?

## Alternatives considered

What else was on the table, and why was it not chosen?

## Consequences

What becomes easier or harder as a result?
```
