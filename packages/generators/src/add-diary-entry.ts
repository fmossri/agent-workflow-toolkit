#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { flagOrDefault, parseArgs, requireFlag } from "./lib/args.ts";
import { appendDiaryEntry, createDiary } from "./lib/diary.ts";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Create a new diary or append a well-formed entry. No diary index (ADR-0008).
 *
 * New diary:
 *   node add-diary-entry.ts --create-diary --file-stamp 2026-06-17-1600 \
 *     --timestamp "2026-06-17 16:00 (UTC-3)" --summary "..." --keywords "a,b" \
 *     --entry-stamp "2026-06-17 16:05" --subject "First entry" --body "..."
 *
 * Append to existing:
 *   node add-diary-entry.ts --diary docs/agent-diaries/agent-diary-....md \
 *     --entry-stamp "2026-06-17 16:10" --subject "..." --body "..." [--handoff]
 */
function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const repoRoot = resolve(flagOrDefault(flags, "repo-root", process.cwd()));
  const diariesDir = join(repoRoot, "docs/agent-diaries");
  const isNew = flags["create-diary"] === true;

  const entryStamp = requireFlag(flags, "entry-stamp");
  const subject = requireFlag(flags, "subject");
  const body = requireFlag(flags, "body");
  const handoff = "handoff" in flags && flags.handoff === true;

  let diaryPath: string;

  if (isNew) {
    const fileStamp = requireFlag(flags, "file-stamp");
    const timestamp = requireFlag(flags, "timestamp");
    const summary = requireFlag(flags, "summary");
    const keywordsRaw = requireFlag(flags, "keywords");
    const keywords = keywordsRaw.split(",").map((kw) => kw.trim());

    diaryPath = createDiary({
      diariesDir,
      fileStamp,
      timestamp,
      summary,
      keywords,
      templatePath: join(PACKAGE_ROOT, "templates/diary-header.md"),
    });
    console.log(`add-diary-entry: created ${diaryPath}`);
  } else {
    const diaryArg = flagOrDefault(flags, "diary", "");
    if (diaryArg.length === 0) {
      console.error("add-diary-entry: pass --create-diary or --diary <path>");
      process.exitCode = 1;
      return;
    }
    diaryPath = resolve(repoRoot, diaryArg);
    if (!existsSync(diaryPath)) {
      console.error(`add-diary-entry: diary not found: ${diaryPath}`);
      process.exitCode = 1;
      return;
    }
  }

  appendDiaryEntry({ diaryPath, entryStamp, subject, body, handoff });
  console.log(`add-diary-entry: appended entry to ${diaryPath}`);
  console.log("Next: run pnpm doc-lint.");
}

main();
