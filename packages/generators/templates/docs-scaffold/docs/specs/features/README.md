---
title: "Feature specs & one-agent-per-feature workflow"
type: index
status: living
updated: {{DATE}}
---

# Feature specs & one-agent-per-feature workflow

Each agent session implements **one** backlog item, scoped by a small **feature spec**
under this directory. This is **layer 5 (process)** of the agent framework — it does
**not** prescribe how project code is organized.

Process authority: git/PR policy (record as ADR-0005 during kickstart) and
[`agent-workflow.md`](../agent-workflow.md) §7.

> **Prerequisite:** the project has completed [kickstart](../../kickstart.md) (or equivalent)
> — requirements, architecture, and backlog are populated. Do not pick backlog items from
> empty template placeholders.

## Session workflow

1. **Pick one backlog item** — copy it into [`docs/TODO.md`](../../TODO.md) as the
   session's working set. One feature, one branch, one PR.
2. **Scaffold the feature spec** (do not hand-write front-matter):

   ```bash
   pnpm gen:create-feature-spec --slug user-auth --backlog-id PROJ-1 \
     --goal "Implement user sign-in"
   ```

   Writes `docs/specs/features/<slug>.md` only. Works for any work type — fill
   **touched modules** with whatever paths this project uses.

3. **Fill the feature spec** — structural/behavioral acceptance criteria, touched paths,
   out-of-scope notes. Set `status: Active` when implementation starts.
4. **Implement** until every acceptance criterion is checked and all gates pass.
5. **Open a PR** from `feat/<backlog-id>-<slug>` — never push to `main`. Reference
   the backlog ID in commits and the PR body.
6. **Close the loop** — when the owner merges, set the feature spec to
   `status: Completed` and mark the backlog item `completed` in
   [`backlog.md`](../../backlog.md).

Start a diary ([`docs/agent-diaries/`](../../agent-diaries/README.md)), read the
latest diary's ` — HANDOFF` entry, and end with your own handoff if work continues.

## Feature-spec conventions

Path: `docs/specs/features/<kebab-slug>.md` — one file per session scope.

### Front-matter

```yaml
---
title: "Feature: <slug>"
type: feature-spec
status: Draft | Active | Completed | Superseded
updated: YYYY-MM-DD
backlog_ids: [PROJ-1] # one or more stable backlog IDs
---
```

Machine-checked by `pnpm doc-lint` against the schema in
`node_modules/@agent-workflow/doc-linter/front-matter.schema.json`.

### Body sections

| Section                 | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `# Feature: <slug>`     | Single H1 (doc-linter rule)                           |
| **Goal**                | One paragraph — what "done" means for the user/system |
| **Acceptance criteria** | Checklist; see patterns below                         |
| **Touched modules**     | Paths this feature may change (scope guard)           |
| **Out of scope**        | Explicit non-goals — prevents scope creep mid-session |

## Acceptance-criteria patterns

"Done" is not a judgment call. Write criteria so an agent (or CI) can verify them.

### 1. Gates (always include — machine-checkable)

Every feature spec includes these four. They mirror the enforcement matrix in
`agent-workflow.md` §8:

```markdown
- [ ] **gate:** `pnpm lint` passes
- [ ] **gate:** `pnpm typecheck` passes
- [ ] **gate:** `pnpm test` passes
- [ ] **gate:** `pnpm doc-lint` passes (when docs under `docs/` or `AGENTS.md` changed)
```

### 2. Structural (project-specific — prefer machine-checkable)

Tie layout to **this project's** architecture doc and concrete paths:

```markdown
- [ ] **structural:** new module lives at `<path>` per `docs/architecture.md`
- [ ] **structural:** layering rule X passes (project lint / convention)
```

If layout is not decided yet, record an ADR first — do not invent framework defaults.

### 3. Behavioral (manual — be concrete)

State the observable outcome and how to verify it (endpoint, test name, fixture):

```markdown
- [ ] **behavior:** `POST /login` returns 200 with a session token (see `auth.test.ts`
      "issues token on valid credentials")
```

Avoid vague criteria ("works correctly", "handles errors well"). If it cannot be
tested yet, say exactly what manual step proves it.

### Prefix legend

| Prefix          | Verified by                                  |
| --------------- | -------------------------------------------- |
| **gate:**       | CI/local script (`pnpm …`)                   |
| **structural:** | project architecture, path exists, lint rule |
| **behavior:**   | test name, curl step, or fixture             |

Check items in the feature spec as you complete them (`- [x]`). All boxes must be
ticked before opening the PR.

## Branch naming

`feat/<backlog-id>-<slug>` — e.g. `feat/PROJ-1-user-auth`. Conventional Commits;
reference the backlog ID in the commit message.

## Related artifacts

| Artifact                              | Role                                             |
| ------------------------------------- | ------------------------------------------------ |
| `.cursor/skills/create-feature-spec/` | When/how to run the portable scope-doc generator |
| `.cursor/rules/feature-workflow.mdc`  | This workflow when editing feature specs         |
| `.cursor/rules/git-workflow.mdc`      | Branch/PR policy (always apply)                  |
| Project architecture doc              | Structural criteria source of truth              |
