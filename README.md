# Agent workflow toolkit

Personal, **docs-first** toolkit for standardizing how coding agents work in a repo —
deterministic generators, doc-linter, and `templates/` (docs + Cursor). Templates live in
**this package** (under `node_modules` when installed); consumer projects only receive
scaffolded output.

Not an agent runtime (LangGraph, etc.) — a **workflow**: process, schemas, gates, and
one-feature-per-session conventions.

## Consumer setup

Install as **devDependencies**:

```bash
pnpm add -D \
  "github:fmossri/agent-workflow-toolkit#path:packages/generators" \
  "github:fmossri/agent-workflow-toolkit#path:packages/doc-linter" \
  tsx
```

## Phase A — one command (structure adoption)

**First run** (before `gen:scaffold-docs` is in `package.json`):

```bash
pnpm exec tsx node_modules/@agent-workflow/generators/src/scaffold-docs-structure.ts \
  --target . \
  --project-name "My App" \
  --project-description "One-line description."
```

This scaffolds:

- missing **`AGENTS.md`** + **`docs/*`**
- missing **`gen:*`** and **`doc-lint`** scripts in **`package.json`**
- **`.cursor/rules/`** + **`.cursor/skills/`** when running **inside Cursor** (auto-detected)

Flags:

- **`--with-cursor`** — add `.cursor/` even outside Cursor
- **`--no-cursor`** — skip `.cursor/` even inside Cursor
- **`--force`** — overwrite existing scaffold files
- **`--no-wire-scripts`** — skip merging scripts into `package.json`

Subsequent runs: `pnpm gen:scaffold-docs --target . --project-name "…" --project-description "…"`

Idempotent — skips existing paths unless `--force`.

Non-Cursor agents follow `AGENTS.md` + `docs/kickstart.md` after scaffold.

## Packages

| Package | Role |
| ------- | ---- |
| `@agent-workflow/generators` | Scaffolders + canonical `templates/` (docs-scaffold + cursor) |
| `@agent-workflow/doc-linter` | Front-matter schema, ADR index, link checks |

## Development (this repo)

```bash
pnpm install
pnpm lint && pnpm typecheck && pnpm test
```
