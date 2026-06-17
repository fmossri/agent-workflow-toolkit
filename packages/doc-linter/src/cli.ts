#!/usr/bin/env node
import { relative, resolve } from "node:path";

import { lintDocs } from "./lint.ts";

/**
 * CLI entry: validate the docs of a repo (default: cwd). Prints one line per
 * problem and exits non-zero when any are found, so it gates lint-staged and CI.
 *
 *   node src/cli.ts [repoRoot]
 */
function main(): void {
  const repoRoot = resolve(process.argv[2] ?? process.cwd());
  const problems = lintDocs({
    docsDir: resolve(repoRoot, "docs"),
    extraFiles: [resolve(repoRoot, "AGENTS.md")],
  });

  if (problems.length === 0) {
    console.log(
      "doc-lint: all docs conform (front-matter schema, headings, relative links, ADR-index sync)",
    );
    return;
  }

  for (const problem of problems) {
    console.error(`${relative(repoRoot, problem.file)}: ${problem.message}`);
  }
  console.error(`\ndoc-lint: ${String(problems.length)} problem(s) found`);
  process.exitCode = 1;
}

main();
