---
title: "Specifications"
type: index
updated: {{DATE}}
---

# Specifications

Specs give focused treatment to a cross-cutting concern — one topic, one document.

## Index

| Spec | Status | Summary |
| ---- | ------ | ------- |

## When to create a new spec

Create one when a subject becomes concrete enough that it no longer fits as a
section of an existing doc. Add the new spec to the index above.

## Conventions

Each spec starts with YAML **front-matter**:

```yaml
---
title: "<spec title>"
type: spec
status: Draft | Active | Superseded
scope: "<one-line scope statement>"
motivated_by: [ADR-XXXX]
updated: YYYY-MM-DD
---
```

Feature-scoped specs live under `docs/specs/features/` (`type: feature-spec`).
Process, acceptance-criteria patterns, and branch naming:
[`features/README.md`](features/README.md) (AF-8).
