#!/usr/bin/env node
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { flagOrDefault, parseArgs, requireFlag } from "./lib/args.ts";
import { createPostmortem, readIncidentStatus, slugifyPostmortemTitle } from "./lib/postmortem.ts";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const STATUSES = ["draft", "published"] as const;

function findIncidentFile(incidentsDir: string, incidentId: string): string | undefined {
  if (!existsSync(incidentsDir)) {
    return undefined;
  }
  return readdirSync(incidentsDir).find((name) => name.startsWith(`${incidentId}-`));
}

/**
 * Create a postmortem under docs/postmortems/ linked to an existing incident report.
 *
 *   node create-postmortem.ts --incident-id INC-2026-001 --title "Stale panel root cause" \
 *     --summary "Cache TTL too long; fixed in PR 42" [--slug stale-panel] [--status draft]
 */
function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const repoRoot = resolve(flagOrDefault(flags, "repo-root", process.cwd()));
  const incidentId = requireFlag(flags, "incident-id");
  const title = requireFlag(flags, "title");
  const summary = requireFlag(flags, "summary");
  const slug = flagOrDefault(flags, "slug", slugifyPostmortemTitle(title));
  const status = flagOrDefault(flags, "status", "draft");
  const date = flagOrDefault(flags, "date", new Date().toISOString().slice(0, 10));
  const allowOpen = "allow-open-incident" in flags && flags["allow-open-incident"] === true;

  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    console.error(`create-postmortem: invalid status "${status}"`);
    process.exitCode = 1;
    return;
  }

  try {
    const filePath = createPostmortem({
      repoRoot,
      templatePath: join(PACKAGE_ROOT, "templates/postmortem.md"),
      incidentId,
      title,
      slug,
      summary,
      status: status as (typeof STATUSES)[number],
      date,
    });

    if (!allowOpen) {
      const incidentsDir = join(repoRoot, "docs/incident-reports");
      const incidentFile = findIncidentFile(incidentsDir, incidentId);
      if (incidentFile !== undefined) {
        const incidentStatus = readIncidentStatus(join(incidentsDir, incidentFile));
        if (incidentStatus !== undefined && incidentStatus !== "resolved") {
          console.warn(
            `create-postmortem: warning — linked incident ${incidentId} has status "${incidentStatus}" (expected "resolved")`,
          );
        }
      }
    }

    console.log(`create-postmortem: wrote ${filePath}`);
    console.log(
      "Next: fill Summary/Timeline/Root cause/Resolution/Verification/Prevention, then run pnpm doc-lint.",
    );
  } catch (error) {
    console.error(`create-postmortem: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

main();
