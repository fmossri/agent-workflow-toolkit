import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { fillTemplate, readTemplate } from "./template.ts";

export interface NewDiaryOptions {
  readonly diariesDir: string;
  readonly fileStamp: string;
  readonly timestamp: string;
  readonly summary: string;
  readonly keywords: readonly string[];
  readonly templatePath: string;
}

export interface DiaryEntryOptions {
  readonly diaryPath: string;
  readonly entryStamp: string;
  readonly subject: string;
  readonly body: string;
  readonly handoff: boolean;
}

function formatKeywords(keywords: readonly string[]): string {
  const items = keywords
    .slice(0, 5)
    .map((kw) => kw.trim())
    .filter((kw) => kw.length > 0);
  if (items.length === 0) {
    throw new Error("at least one keyword is required for a new diary");
  }
  return `[${items.map((kw) => (kw.includes(" ") ? `"${kw}"` : kw)).join(", ")}]`;
}

export function diaryFilename(fileStamp: string): string {
  return `agent-diary-${fileStamp}.md`;
}

export function createDiary(options: NewDiaryOptions): string {
  const filePath = join(options.diariesDir, diaryFilename(options.fileStamp));
  if (existsSync(filePath)) {
    throw new Error(`diary already exists: ${filePath}`);
  }

  const header = readTemplate(options.templatePath, {
    TIMESTAMP: options.timestamp,
    SUMMARY: options.summary,
    KEYWORDS: formatKeywords(options.keywords),
  });

  writeFileSync(filePath, `${header}\n`, "utf8");
  return filePath;
}

export function appendDiaryEntry(options: DiaryEntryOptions): void {
  if (!existsSync(options.diaryPath)) {
    throw new Error(`diary not found: ${options.diaryPath}`);
  }

  const suffix = options.handoff ? " — HANDOFF" : "";
  const entry = fillTemplate(
    readFileSync(join(import.meta.dirname, "../../templates/diary-entry.md"), "utf8"),
    {
      ENTRY_STAMP: options.entryStamp,
      SUBJECT: options.subject,
      BODY: options.body.trim(),
      HANDOFF_SUFFIX: suffix,
    },
  );

  const existing = readFileSync(options.diaryPath, "utf8");
  const separator = existing.endsWith("\n") ? "\n" : "\n\n";
  appendFileSync(options.diaryPath, `${separator}${entry}`, "utf8");
}
