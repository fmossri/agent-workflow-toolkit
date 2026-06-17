#!/usr/bin/env node
import { resolve } from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createAdr, slugifyAdrTitle } from "./lib/adr.ts";
import { flagOrDefault, parseArgs, requireFlag } from "./lib/args.ts";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Create the next-numbered ADR file and insert an index row in docs/adr/README.md.
 *
 *   node create-adr.ts --repo-root . --title "My decision" [--slug short-title]
 *     [--status Proposed] [--date YYYY-MM-DD] [--deciders "owner, agent"]
 */
function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const repoRoot = resolve(flagOrDefault(flags, "repo-root", process.cwd()));
  const title = requireFlag(flags, "title");
  const slug = flagOrDefault(flags, "slug", slugifyAdrTitle(title));
  const status = flagOrDefault(flags, "status", "Proposed");
  const date = flagOrDefault(flags, "date", new Date().toISOString().slice(0, 10));
  const deciders = flagOrDefault(flags, "deciders", "Project owner, agent");

  if (!["Proposed", "Accepted", "Superseded", "Deprecated"].includes(status)) {
    console.error(`create-adr: invalid status "${status}"`);
    process.exitCode = 1;
    return;
  }

  const { num, filePath } = createAdr({
    adrDir: join(repoRoot, "docs/adr"),
    templatePath: join(PACKAGE_ROOT, "templates/adr.md"),
    title,
    slug,
    status: status as "Proposed" | "Accepted" | "Superseded" | "Deprecated",
    date,
    deciders,
  });

  console.log(`create-adr: wrote ADR-${num} → ${filePath}`);
  console.log("Next: fill in Context/Decision/Alternatives/Consequences, then run pnpm doc-lint.");
}

main();
