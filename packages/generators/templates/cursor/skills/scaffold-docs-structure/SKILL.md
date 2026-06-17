---
name: scaffold-docs-structure
description: >-
  Scaffolds the generic docs tree (AGENTS.md + docs/) and wires toolkit scripts. In
  Cursor, also scaffolds .cursor/rules + .cursor/skills automatically. Idempotent —
  skips existing files. Use when adopting the agent workflow toolkit, bootstrapping
  documentation structure, or when the user mentions scaffold-docs-structure or docs scaffold.
---

# Scaffold docs structure

Requires **`@agent-workflow/generators`** and **`@agent-workflow/doc-linter`** installed
(devDependencies) plus **`tsx`**. Templates live in `node_modules` — only scaffold
**output** is written to `--target`.

**Phase A (structure adoption)** only. **Phase B (content bootstrap)** — see
`docs/kickstart.md`; ask the user before filling content.

## Before running

1. Confirm `--target` is the **project root** the user intends.
2. List which framework paths already exist vs would be created.
3. **Ask the user** to confirm structure adoption (and optionally content bootstrap after).

## Run the generator

**First run** (before `gen:scaffold-docs` is wired in `package.json`):

```bash
pnpm exec tsx node_modules/@agent-workflow/generators/src/scaffold-docs-structure.ts \
  --target . \
  --project-name "Project Name" \
  --project-description "One-line description."
```

**After scripts are wired:**

```bash
pnpm gen:scaffold-docs --target . \
  --project-name "Project Name" \
  --project-description "One-line description."
```

### Cursor integration

When running **inside Cursor**, the generator **automatically** scaffolds
`.cursor/rules/` and `.cursor/skills/` (mandatory in Cursor — not optional).

- **`--with-cursor`** — force Cursor scaffold even outside Cursor.
- **`--no-cursor`** — skip Cursor scaffold even inside Cursor.

The generator also merges missing **`gen:*`** and **`doc-lint`** scripts into root
`package.json` (skips keys that already exist).

### Other flags

- **Default:** skip existing files; log `created` vs `skipped`.
- **`--force`:** overwrite existing scaffold files (destructive — user must confirm).
- **`--no-wire-scripts`:** skip merging scripts into `package.json`.

## After structure adoption

1. If placeholders remain in `requirements.md` / `backlog.md`, offer **content bootstrap**
   per `docs/kickstart.md` (user opt-in).
2. Run `pnpm doc-lint`.
3. Run `pnpm format` on new Markdown files when Prettier is wired.

See `docs/kickstart.md` for install from
[GitHub](https://github.com/fmossri/agent-workflow-toolkit).
