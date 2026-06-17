#!/usr/bin/env node
import { resolve } from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseArgs, requireFlag } from "./lib/args.ts";
import { copyTreeWithTemplates } from "./lib/copy-tree.ts";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE_ROOT = join(PACKAGE_ROOT, "templates/docs-scaffold");

/**
 * Scaffold the generic docs tree + AGENTS.md into a target directory.
 * Idempotent by default: skips files that already exist (never overwrites
 * architecture.md, requirements.md, etc.).
 *
 *   node scaffold-docs-structure.ts --target /path/to/repo \
 *     --project-name "My App" --project-description "One-line description"
 *
 * Pass --force to overwrite existing files (destructive — explicit opt-in).
 */
function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const target = resolve(requireFlag(flags, "target"));
  const projectName = requireFlag(flags, "project-name");
  const projectDescription = requireFlag(flags, "project-description");
  const force = "force" in flags && flags.force === true;
  const date = new Date().toISOString().slice(0, 10);

  const { created, skipped } = copyTreeWithTemplates(
    TEMPLATE_ROOT,
    target,
    {
      PROJECT_NAME: projectName,
      PROJECT_DESCRIPTION: projectDescription,
      DATE: date,
    },
    { skipExisting: !force },
  );

  console.log(`scaffold-docs-structure: target ${target}`);
  console.log(`  created: ${String(created.length)} file(s)`);
  if (created.length > 0) {
    for (const rel of created) console.log(`    + ${rel}`);
  }
  console.log(`  skipped (already exist): ${String(skipped.length)} file(s)`);
  if (skipped.length > 0 && skipped.length <= 12) {
    for (const rel of skipped) console.log(`    = ${rel}`);
  } else if (skipped.length > 12) {
    console.log(`    (${String(skipped.length)} paths — use --force to overwrite)`);
  }

  if (created.length === 0 && skipped.length === 0) {
    console.error("scaffold-docs-structure: nothing to do — check --target");
    process.exitCode = 1;
    return;
  }

  console.log(
    "Next: agent or user runs content bootstrap per docs/kickstart.md (opt-in; does not overwrite existing docs).",
  );
}

main();
