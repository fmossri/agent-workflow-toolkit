#!/usr/bin/env node
import { resolve } from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { flagOrDefault, parseArgs, requireFlag } from "./lib/args.ts";
import { createIncidentReport, slugifyIncidentTitle } from "./lib/incident-report.ts";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const SEVERITIES = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["open", "investigating", "resolved"] as const;

/**
 * Create an incident report under docs/incident-reports/ (portable generator — doc only).
 *
 *   node create-incident-report.ts --title "Stale panel data" --summary "Users see old maps" \
 *     [--slug stale-panel] [--severity medium] [--status open] [--backlog-id PROJ-1]
 */
function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const repoRoot = resolve(flagOrDefault(flags, "repo-root", process.cwd()));
  const title = requireFlag(flags, "title");
  const summary = requireFlag(flags, "summary");
  const slug = flagOrDefault(flags, "slug", slugifyIncidentTitle(title));
  const severity = flagOrDefault(flags, "severity", "medium");
  const status = flagOrDefault(flags, "status", "open");
  const date = flagOrDefault(flags, "date", new Date().toISOString().slice(0, 10));
  const year = flagOrDefault(flags, "year", date.slice(0, 4));
  const backlogId = flagOrDefault(flags, "backlog-id", "");

  if (!SEVERITIES.includes(severity as (typeof SEVERITIES)[number])) {
    console.error(`create-incident-report: invalid severity "${severity}"`);
    process.exitCode = 1;
    return;
  }
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    console.error(`create-incident-report: invalid status "${status}"`);
    process.exitCode = 1;
    return;
  }

  try {
    const filePath = createIncidentReport({
      repoRoot,
      templatePath: join(PACKAGE_ROOT, "templates/incident-report.md"),
      title,
      slug,
      severity: severity as (typeof SEVERITIES)[number],
      summary,
      status: status as (typeof STATUSES)[number],
      date,
      year,
      ...(backlogId.length > 0 ? { backlogId } : {}),
    });
    console.log(`create-incident-report: wrote ${filePath}`);
    console.log("Next: fill Reported/Impact/Observations/Hypotheses, then run pnpm doc-lint.");
  } catch (error) {
    console.error(
      `create-incident-report: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}

main();
