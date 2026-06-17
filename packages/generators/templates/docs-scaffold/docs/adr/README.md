---
title: "Architecture Decision Records (ADRs)"
type: index
updated: {{DATE}}
---

# Architecture Decision Records (ADRs)

An ADR captures a single significant decision: the context, the choice, and the
consequences. ADRs are **binding** — treat an `Accepted` ADR as settled unless a
newer ADR supersedes it.

## Index

| #   | Title | Status |
| --- | ----- | ------ |

## How to add an ADR

Prefer the **`create-adr` generator** (AF-4) or:

1. Copy the template below into `NNNN-short-title.md` (zero-padded, next number).
2. Fill it in. Keep it short — one decision per ADR.
3. Set the status (`Proposed` → `Accepted` once agreed).
4. Add a row to the index above.
5. Never edit the substance of an `Accepted` ADR to reverse it — write a new ADR
   that supersedes it.

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
