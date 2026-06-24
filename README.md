# Agent workflow toolkit

Personal, **docs-first** toolkit for standardizing how coding agents work in a repo —
deterministic generators, a doc-linter, and `templates/` (docs + Cursor rules/skills).
Templates live in **this package** (under `node_modules` when installed); consumer
projects only receive scaffolded output.

Not an agent runtime (LangGraph, etc.) — a **workflow**: process, schemas, gates, and
one-feature-per-session conventions.

## Packages

| Package                      | Role                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `@agent-workflow/generators` | Scaffolders, generators, and canonical `templates/` (docs-scaffold + cursor)  |
| `@agent-workflow/doc-linter` | Front-matter schema, ADR index sync, incident/postmortem id sync, link checks |

## Consumer setup

Install as **devDependencies**:

```bash
pnpm add -D \
  "github:fmossri/agent-workflow-toolkit#path:packages/generators" \
  "github:fmossri/agent-workflow-toolkit#path:packages/doc-linter" \
  tsx
```

## Phase A — structure adoption (one command)

**First run** (before `gen:scaffold-docs` is in `package.json`):

```bash
pnpm exec tsx node_modules/@agent-workflow/generators/src/scaffold-docs-structure.ts \
  --target . \
  --project-name "My App" \
  --project-description "One-line description."
```

This scaffolds:

- missing **`AGENTS.md`** + **`docs/*`** workflow files
- missing **`gen:*`** and **`doc-lint`** scripts in **`package.json`**
- **`.cursor/rules/`** + **`.cursor/skills/`** when running **inside Cursor** (auto-detected)

Flags:

- **`--with-cursor`** — add `.cursor/` even outside Cursor
- **`--no-cursor`** — skip `.cursor/` even inside Cursor
- **`--force`** — overwrite existing scaffold files
- **`--no-wire-scripts`** — skip merging scripts into `package.json`

Subsequent runs: `pnpm gen:scaffold-docs --target . --project-name "…" --project-description "…"`

Idempotent — skips existing paths unless `--force`.

## Phase B — content bootstrap (owner interview)

After phase A, if `docs/requirements.md` and `docs/backlog.md` still hold placeholders,
run the content bootstrap sequence per `docs/kickstart.md`:

1. **Requirements elicitation** — structured owner interview (vision, scope, FR/NFR tables, assumptions, open questions)
2. **Requirements specification** — draft `requirements.md`; owner approves before step 3
3. **Architecture** — `architecture.md`
4. **ADRs** — for open/deferred decisions; owner participates before the ADR file is created
5. **Backlog** — `backlog.md` with milestone IDs
6. **Working slice** — `TODO.md`
7. **Diary handoff** — ` — HANDOFF` entry

Non-Cursor agents follow `AGENTS.md` + `docs/kickstart.md` after phase A.

## Generators (`gen:*`)

After phase A wires scripts into `package.json`:

| Script                       | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `gen:scaffold-docs`          | Idempotent docs + Cursor scaffold                                     |
| `gen:create-adr`             | Next-numbered ADR (+ index row); requires owner participation first   |
| `gen:diary-entry`            | New diary or append entry                                             |
| `gen:create-feature-spec`    | Feature scope doc under `docs/specs/features/`                        |
| `gen:create-incident-report` | Next `INC-YYYY-NNN` incident report (run **before** fixing)           |
| `gen:create-postmortem`      | Postmortem linked to an incident (run **after** fix, with permission) |

## Cursor scaffold

Phase A drops these under `.cursor/` (inside Cursor by default; `--with-cursor` elsewhere):

**Rules** (`alwaysApply: true` unless noted):

| Rule                      | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `owner-participation.mdc` | STOP before `gen:create-adr` / binding edits without owner in thread |
| `git-workflow.mdc`        | Branch/PR policy; no commit or PR without owner permission           |
| `feature-workflow.mdc`    | One-feature-per-session; session closeout before commit              |
| `docs-and-diaries.mdc`    | Front-matter, diary quality, ADR discipline                          |
| `kickstart.mdc`           | Phase A/B adoption and content bootstrap                             |
| `pattern-promotion.mdc`   | Propose recurring code shapes before scaffolding                     |
| `formatting.mdc`          | Prettier is the formatting authority                                 |
| `typescript.mdc`          | TypeScript/ESLint conventions                                        |

**Skills:**

| Skill                     | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| `scaffold-docs-structure` | Phase A scaffold                         |
| `create-adr`              | ADR with Step 0 owner participation gate |
| `add-diary-entry`         | Well-formed diary headers and entries    |
| `create-feature-spec`     | Session scope doc                        |
| `create-incident-report`  | Incident report before fixing            |
| `create-postmortem`       | Post-incident write-up                   |

## Doc-linter checks

`pnpm doc-lint` fails on:

- Invalid front-matter (type, required fields, enum values)
- Non-ISO dates
- Exactly one `# H1` heading per file
- Broken relative links
- ADR index drift (every ADR file must appear in `adr/README.md`)
- Incident/postmortem `id` must match filename (`INC-YYYY-NNN`, `PM-YYYY-NNN`)
- Postmortem `incident_id` must reference an existing incident report

Front-matter types: `adr`, `spec`, `diary`, `feature-spec`, `guide`, `index`,
`requirements`, `architecture`, `backlog`, `todo`, `incident-report`, `postmortem`.

`backlog_ids` accepts IDs like `M1-6` or `M1-5.5` (one optional dotted numeric suffix
for inserted work).

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

   This picks up new files (e.g. `owner-participation.mdc`, new skills) without touching
   paths that already exist.

3. **Merge updated prose** into customized docs — scaffold skips files you already edited.
   Compare your copy to
   `node_modules/@agent-workflow/generators/templates/docs-scaffold/` and merge changed
   sections. Do not use `--force` on real project docs.

4. **Refresh Cursor rules/skills** selectively: copy individual files from
   `node_modules/@agent-workflow/generators/templates/cursor/` or delete a stale file
   and re-run scaffold to recreate it.

5. **Verify:** `pnpm doc-lint`.

For greenfield repos a fresh `gen:scaffold-docs` after upgrade is enough. For repos with
project-specific doc content, expect a short manual merge pass.

## Development (this repo)

```bash
pnpm install
pnpm lint && pnpm typecheck && pnpm test
```
