---
name: scaffold-docs-structure
description: >-
  Scaffolds the generic docs tree (AGENTS.md + docs/) for a new or in-progress repo using
  the deterministic generator. Idempotent — skips existing files. Use when adopting the
  agent framework, bootstrapping documentation structure, or when the user mentions
  scaffold-docs-structure or docs scaffold.
---

# Scaffold docs structure

Requires **`@agent-workflow/generators`** installed (templates live in that package under
`node_modules` — they are **not** copied into the consumer repo).

**Phase A (structure adoption)** only. **Phase B (content bootstrap)** — see
`docs/kickstart.md`; ask the user before filling content.

## Before running

1. Confirm `--target` is the **project root** the user intends.
2. List which framework paths already exist vs would be created.
3. **Ask the user** to confirm structure adoption (and optionally content bootstrap after).

## Run the generator

```bash
pnpm gen:scaffold-docs --target /path/to/project \
  --project-name "Project Name" \
  --project-description "One-line description."
```

- **Default:** skip existing files; log `created` vs `skipped`.
- **`--force`:** overwrite existing files (destructive — user must confirm).

## After structure adoption

1. If placeholders remain in `requirements.md` / `backlog.md`, offer **content bootstrap**
   per `docs/kickstart.md` (user opt-in).
2. Run `pnpm doc-lint` when the doc-linter is wired in.
3. Run `pnpm format` on new Markdown files.

## Install (consumer project)

```bash
pnpm add -D link:../agent-workflow/packages/generators link:../agent-workflow/packages/doc-linter
```

See the framework repo `README.md` for script wiring.
