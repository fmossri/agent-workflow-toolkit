---
title: "Feature: {{SLUG}}"
type: feature-spec
status: Draft
updated: {{DATE}}
backlog_ids: [{{BACKLOG_ID}}]
---

# Feature: {{SLUG}}

## Goal

{{GOAL}}

## Acceptance criteria

Check each item before opening the PR. Use the **gate:** / **structural:** /
**behavior:** prefixes — see `docs/specs/features/README.md`.

### Gates

- [ ] **gate:** `pnpm lint` passes
- [ ] **gate:** `pnpm typecheck` passes
- [ ] **gate:** `pnpm test` passes
- [ ] **gate:** `pnpm doc-lint` passes (when docs under `docs/` or `AGENTS.md` changed)

### Structural

- [ ] **structural:** _List concrete paths or project conventions for this feature (see project architecture doc — not prescribed by the agent framework)._

### Behavioral

- [ ] **behavior:** _Describe the observable outcome and how to verify (test name, endpoint, fixture)._

## Touched modules

- _List paths this feature may change (scope guard)._

## Out of scope

- _List explicit non-goals for this feature._
