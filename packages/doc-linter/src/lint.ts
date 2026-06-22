import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { checkAdrIndex } from "./adr-index.ts";
import { checkBody } from "./body.ts";
import { checkIncidentDocs } from "./incident-docs.ts";
import { extractFrontMatter } from "./frontmatter.ts";
import { validateFrontMatter } from "./schema.ts";
import type { Problem } from "./types.ts";

export interface LintOptions {
  /** The `docs/` directory to scan recursively for Markdown files. */
  readonly docsDir: string;
  /** Extra individual files to validate (e.g. a repo-root `AGENTS.md`). */
  readonly extraFiles?: readonly string[];
}

function collectMarkdownFiles(docsDir: string): string[] {
  if (!existsSync(docsDir)) {
    return [];
  }
  return readdirSync(docsDir, { recursive: true, encoding: "utf8" })
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => join(docsDir, entry));
}

function lintFile(file: string): Problem[] {
  const { data, error, body } = extractFrontMatter(readFileSync(file, "utf8"));
  if (error !== null || data === null) {
    return [{ file, message: error ?? "could not parse front-matter" }];
  }
  return [
    ...validateFrontMatter(data).map((message) => ({ file, message })),
    ...checkBody(file, body),
  ];
}

/**
 * Run the documentation structure checks: front-matter schema validation (AF-7)
 * on every doc, plus ADR-index and incident-doc sync. Returns all problems, sorted
 * by file path.
 * Markdown *style* is out of scope — Prettier owns that (ADR-0009).
 */
export function lintDocs(options: LintOptions): Problem[] {
  const files = [
    ...collectMarkdownFiles(options.docsDir),
    ...(options.extraFiles ?? []).filter((file) => existsSync(file)),
  ];

  const problems = files.flatMap(lintFile);
  problems.push(...checkAdrIndex(options.docsDir));
  problems.push(...checkIncidentDocs(options.docsDir));

  return problems.sort(
    (a, b) => a.file.localeCompare(b.file) || a.message.localeCompare(b.message),
  );
}
