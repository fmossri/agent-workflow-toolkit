---
name: create-feature-spec
description: >-
  Creates a feature-spec scope doc under docs/specs/features/ for a one-agent-per-feature
  session. Use when starting work on a backlog item, scoping a feature, or when the user
  mentions create-feature-spec or feature spec scaffolding.
---

# Create feature spec

Portable `@agent-workflow/generators` scope doc (ADR-0006) — **doc only**. Does not scaffold project
code layout; structural acceptance criteria reference **this project's** architecture
doc, not a toolkit default.

Full workflow and acceptance-criteria patterns: `docs/specs/features/README.md`.

## Run the generator

From the repo root:

```bash
pnpm gen:create-feature-spec --slug user-auth --backlog-id PROJ-1 \
  --goal "Implement user sign-in"
```

- **`--slug`**: kebab-case identifier (filename under `docs/specs/features/`).
- **`--backlog-id`**: backlog item this session implements (written to `backlog_ids`;
  IDs like `M1-5.5` are allowed for inserted work).
- **`--goal`**: one-line goal (defaults to `Implement <slug>`).

## After generation

1. Fill **structural** and **behavioral** acceptance criteria and **touched modules**
   for this project — do not assume backend paths.
2. Set `status: Active` when implementation starts.
3. Run `pnpm doc-lint`.
4. Implement on branch `feat/<backlog-id>-<slug>`; check AC boxes before opening the PR.
