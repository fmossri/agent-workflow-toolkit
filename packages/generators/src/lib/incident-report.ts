import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { slugifyAdrTitle } from "./adr.ts";
import { readTemplate } from "./template.ts";

const INCIDENT_FILE_RE = /^INC-(\d{4})-(\d{3})-.+\.md$/;

export interface CreateIncidentReportOptions {
  readonly repoRoot: string;
  readonly templatePath: string;
  readonly title: string;
  readonly slug: string;
  readonly severity: "low" | "medium" | "high" | "critical";
  readonly summary: string;
  readonly status: "open" | "investigating" | "resolved";
  readonly date: string;
  readonly year: string;
  readonly backlogId?: string;
}

export function nextIncidentNumber(incidentsDir: string, year: string): string {
  if (!existsSync(incidentsDir)) {
    return "001";
  }

  let max = 0;
  for (const name of readdirSync(incidentsDir)) {
    const match = INCIDENT_FILE_RE.exec(name);
    if (match?.[1] === year && match[2] !== undefined) {
      max = Math.max(max, Number.parseInt(match[2], 10));
    }
  }
  return String(max + 1).padStart(3, "0");
}

export function incidentFilename(year: string, num: string, slug: string): string {
  return `INC-${year}-${num}-${slug}.md`;
}

export function incidentId(year: string, num: string): string {
  return `INC-${year}-${num}`;
}

/** Write docs/incident-reports/INC-YYYY-NNN-<slug>.md from the portable template. */
export function createIncidentReport(options: CreateIncidentReportOptions): string {
  const incidentsDir = join(options.repoRoot, "docs/incident-reports");
  mkdirSync(incidentsDir, { recursive: true });

  const num = nextIncidentNumber(incidentsDir, options.year);
  const incId = incidentId(options.year, num);
  const filename = incidentFilename(options.year, num, options.slug);
  const filePath = join(incidentsDir, filename);

  if (existsSync(filePath)) {
    throw new Error(`incident report already exists: ${filePath}`);
  }

  const backlogIdsLine =
    options.backlogId !== undefined && options.backlogId.length > 0
      ? `backlog_ids: [${options.backlogId}]\n`
      : "";

  writeFileSync(
    filePath,
    readTemplate(options.templatePath, {
      INC_ID: incId,
      TITLE: options.title,
      STATUS: options.status,
      SEVERITY: options.severity,
      SUMMARY: options.summary,
      DATE: options.date,
      BACKLOG_IDS_LINE: backlogIdsLine,
    }),
    "utf8",
  );

  return filePath;
}

export { slugifyAdrTitle as slugifyIncidentTitle };
