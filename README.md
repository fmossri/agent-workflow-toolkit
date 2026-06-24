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

| Package                      | Role                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| `@agent-workflow/generators` | Scaffolders + canonical `templates/` (docs-scaffold + cursor) |
| `@agent-workflow/doc-linter` | Front-matter schema, ADR/incident sync, link checks           |

## Generators (`gen:*`)

After phase A wires scripts into `package.json`:

| Script                       | Purpose                                                 |
| ---------------------------- | ------------------------------------------------------- |
| `gen:scaffold-docs`          | Idempotent docs + Cursor scaffold                       |
| `gen:create-adr`             | Next-numbered ADR (+ index row)                         |
| `gen:diary-entry`            | New diary or append entry                               |
| `gen:create-feature-spec`    | Feature scope doc under `docs/specs/features/`          |
| `gen:create-incident-report` | Next `INC-YYYY-NNN` incident report (**before** fixing) |
| `gen:create-postmortem`      | Postmortem linked to an incident (**after** fix)        |

## Upgrading the toolkit (existing projects)

Templates and generators live in **`node_modules`** — upgrading the package does not
change your repo until you pull scaffold output or merge docs manually.

1. **Update devDependencies** (git install — bump ref or re-run install):

   ```bash
   pnpm add -D \
     "github:fmossri/agent-workflow-toolkit#path:packages/generators" \
     "github:fmossri/agent-workflow-toolkit#path:packages/doc-linter"
   ```

2. **Re-run phase A** (idempotent — adds **missing** paths only; wires new `gen:*` scripts):

   ```bash
   pnpm gen:scaffold-docs --target . \
     --project-name "My App" \
     --project-description "One-line description."
   ```

   This picks up **new** files (e.g. `.cursor/rules/owner-participation.mdc`, new skills)
   without touching paths that already exist.

3. **Merge updated prose into existing docs** — scaffold **skips** files you already
   customized (`AGENTS.md`, `docs/adr/README.md`, `docs/agent-diaries/README.md`, …).
   Compare your copy to the templates under
   `node_modules/@agent-workflow/generators/templates/` and **merge** the changed
   sections (owner-participation gate, diary checklist, kickstart interview, etc.).
   Do not use `--force` on real project docs unless the owner explicitly wants to
   discard local content.

4. **Cursor rules/skills** — safe to refresh selectively: copy individual files from
   `node_modules/@agent-workflow/generators/templates/cursor/` into `.cursor/`, or
   delete a stale rule/skill and re-run scaffold to recreate it.

5. **Verify:** `pnpm doc-lint` (and project gates as usual).

For greenfield repos, a fresh `gen:scaffold-docs` after upgrade is enough. For dogfooding
repos (e.g. Analegis), expect a short **manual merge PR** for docs the project extended
beyond the scaffold.

## Development (this repo)

```bash
pnpm install
pnpm lint && pnpm typecheck && pnpm test
```
