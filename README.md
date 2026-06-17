# Agent workflow toolkit

Personal, **docs-first** toolkit for standardizing how coding agents work in a repo —
deterministic generators, doc-linter, and `templates/docs-scaffold`. Templates live in
**this package** (under `node_modules` when installed); consumer projects only receive
scaffolded output (`AGENTS.md`, `docs/*`).

Not an agent runtime (LangGraph, etc.) — a **workflow**: process, schemas, gates, and
one-feature-per-session conventions.

## Consumer setup

Install as **devDependencies** (templates stay in `node_modules`, not copied into your repo):

```bash
# Sibling checkout (local dev)
pnpm add -D link:../agent-workflow/packages/generators link:../agent-workflow/packages/doc-linter
```

Wire root scripts (or use these directly):

```json
{
  "scripts": {
    "doc-lint": "node node_modules/@agent-workflow/doc-linter/src/cli.ts",
    "gen:scaffold-docs": "node node_modules/@agent-workflow/generators/src/scaffold-docs-structure.ts",
    "gen:create-adr": "node node_modules/@agent-workflow/generators/src/create-adr.ts",
    "gen:diary-entry": "node node_modules/@agent-workflow/generators/src/add-diary-entry.ts",
    "gen:create-feature-spec": "node node_modules/@agent-workflow/generators/src/create-feature-spec.ts"
  }
}
```

**Phase A — structure adoption** (idempotent; skips existing files):

```bash
pnpm gen:scaffold-docs --target . \
  --project-name "My App" \
  --project-description "One-line description."
```

The generator reads `node_modules/@agent-workflow/generators/templates/docs-scaffold`
and writes into `--target`. Your repo does **not** get a copy of `templates/`.

**Optional:** copy `.cursor/rules/` and `.cursor/skills/` from this repo for Cursor;
non-Cursor agents follow `AGENTS.md` + `docs/kickstart.md` after scaffold.

## Packages

| Package | Role |
| ------- | ---- |
| `@agent-workflow/generators` | Scaffolders + canonical `templates/` |
| `@agent-workflow/doc-linter` | Front-matter schema, ADR index, link checks |

## Development (this repo)

```bash
pnpm install
pnpm lint && pnpm typecheck && pnpm test
```
