#!/usr/bin/env node
import { resolve } from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseArgs, requireFlag } from "./lib/args.ts";
import { copyTreeWithTemplates } from "./lib/copy-tree.ts";
import { shouldScaffoldCursor } from "./lib/detect-cursor.ts";
import { wirePackageScripts } from "./lib/wire-package-scripts.ts";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_TEMPLATE_ROOT = join(PACKAGE_ROOT, "templates/docs-scaffold");
const CURSOR_TEMPLATE_ROOT = join(PACKAGE_ROOT, "templates/cursor");

/**
 * Scaffold the generic docs tree + AGENTS.md into a target directory.
 * Idempotent by default: skips files that already exist (never overwrites
 * architecture.md, requirements.md, etc.).
 *
 * Also wires root package.json scripts (gen:*, doc-lint) when missing.
 *
 * Cursor integration (--with-cursor / auto-detect in Cursor):
 *   copies templates/cursor → .cursor/ (rules + skills).
 *
 *   node scaffold-docs-structure.ts --target /path/to/repo \
 *     --project-name "My App" --project-description "One-line description"
 *
 * Flags:
 *   --with-cursor   Always scaffold .cursor/rules + .cursor/skills
 *   --no-cursor     Skip Cursor scaffold even when running in Cursor
 *   --force         Overwrite existing scaffold files (destructive)
 *   --no-wire-scripts  Skip merging gen:* / doc-lint into package.json
 */
function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const target = resolve(requireFlag(flags, "target"));
  const projectName = requireFlag(flags, "project-name");
  const projectDescription = requireFlag(flags, "project-description");
  const force = "force" in flags && flags.force === true;
  const wireScripts = !("no-wire-scripts" in flags && flags.no-wire-scripts === true);
  const scaffoldCursor = shouldScaffoldCursor(flags);
  const date = new Date().toISOString().slice(0, 10);

  const vars = {
    PROJECT_NAME: projectName,
    PROJECT_DESCRIPTION: projectDescription,
    DATE: date,
  };

  const { created: docsCreated, skipped: docsSkipped } = copyTreeWithTemplates(
    DOCS_TEMPLATE_ROOT,
    target,
    vars,
    { skipExisting: !force },
  );

  let cursorCreated: string[] = [];
  let cursorSkipped: string[] = [];
  if (scaffoldCursor) {
    const cursorResult = copyTreeWithTemplates(
      CURSOR_TEMPLATE_ROOT,
      join(target, ".cursor"),
      vars,
      { skipExisting: !force },
    );
    cursorCreated = [...cursorResult.created];
    cursorSkipped = [...cursorResult.skipped];
  }

  let scriptsAdded: string[] = [];
  let scriptsSkipped: string[] = [];
  const scriptWarnings: string[] = [];
  if (wireScripts) {
    const wireResult = wirePackageScripts(target);
    scriptsAdded = [...wireResult.added];
    scriptsSkipped = [...wireResult.skipped];
    scriptWarnings.push(...wireResult.warnings);
  }

  console.log(`scaffold-docs-structure: target ${target}`);
  console.log(`  docs created: ${String(docsCreated.length)} file(s)`);
  if (docsCreated.length > 0) {
    for (const rel of docsCreated) console.log(`    + ${rel}`);
  }
  console.log(`  docs skipped (already exist): ${String(docsSkipped.length)} file(s)`);
  if (docsSkipped.length > 0 && docsSkipped.length <= 12) {
    for (const rel of docsSkipped) console.log(`    = ${rel}`);
  } else if (docsSkipped.length > 12) {
    console.log(`    (${String(docsSkipped.length)} paths — use --force to overwrite)`);
  }

  if (scaffoldCursor) {
    console.log(`  cursor created: ${String(cursorCreated.length)} file(s)`);
    for (const rel of cursorCreated) console.log(`    + .cursor/${rel}`);
    console.log(`  cursor skipped (already exist): ${String(cursorSkipped.length)} file(s)`);
  } else {
    console.log("  cursor: skipped (--no-cursor or not in Cursor — use --with-cursor to add)");
  }

  if (wireScripts) {
    if (scriptsAdded.length > 0) {
      console.log(`  package.json scripts added: ${scriptsAdded.join(", ")}`);
    }
    if (scriptsSkipped.length > 0) {
      console.log(
        `  package.json scripts already present: ${scriptsSkipped.join(", ")}`,
      );
    }
  }

  for (const warning of scriptWarnings) {
    console.warn(`  warning: ${warning}`);
  }

  const totalCreated = docsCreated.length + cursorCreated.length + scriptsAdded.length;
  const totalSkipped = docsSkipped.length + cursorSkipped.length + scriptsSkipped.length;

  if (totalCreated === 0 && totalSkipped === 0) {
    console.error("scaffold-docs-structure: nothing to do — check --target");
    process.exitCode = 1;
    return;
  }

  console.log(
    "Next: agent or user runs content bootstrap per docs/kickstart.md (opt-in; does not overwrite existing docs).",
  );
}

main();
