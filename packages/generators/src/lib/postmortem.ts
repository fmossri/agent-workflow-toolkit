import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { slugifyAdrTitle } from "./adr.ts";
import { readTemplate } from "./template.ts";

const POSTMORTEM_FILE_RE = /^PM-(\d{4})-(\d{3})-.+\.md$/;
const INCIDENT_ID_RE = /^INC-(\d{4})-(\d{3})$/;

export interface CreatePostmortemOptions {
  readonly repoRoot: string;
  readonly templatePath: string;
  readonly incidentId: string;
  readonly title: string;
  readonly slug: string;
  readonly summary: string;
  readonly status: "draft" | "published";
  readonly date: string;
}

function parseIncidentId(incidentId: string): { readonly year: string; readonly num: string } {
  const match = INCIDENT_ID_RE.exec(incidentId);
  if (match?.[1] === undefined || match[2] === undefined) {
    throw new Error(`incident id must match INC-YYYY-NNN (got "${incidentId}")`);
  }
  return { year: match[1], num: match[2] };
}

function findIncidentReportPath(
  incidentsDir: string,
  incidentId: string,
): string | undefined {
  if (!existsSync(incidentsDir)) {
    return undefined;
  }

  for (const name of readdirSync(incidentsDir)) {
    if (!name.startsWith(`${incidentId}-`) || !name.endsWith(".md")) {
      continue;
    }
    return join(incidentsDir, name);
  }

  return undefined;
}

export function nextPostmortemNumber(postmortemsDir: string, year: string): string {
  if (!existsSync(postmortemsDir)) {
    return "001";
  }

  let max = 0;
  for (const name of readdirSync(postmortemsDir)) {
    const match = POSTMORTEM_FILE_RE.exec(name);
    if (match?.[1] === year && match[2] !== undefined) {
      max = Math.max(max, Number.parseInt(match[2], 10));
    }
  }
  return String(max + 1).padStart(3, "0");
}

function postmortemFilename(year: string, num: string, slug: string): string {
  return `PM-${year}-${num}-${slug}.md`;
}

function postmortemId(year: string, num: string): string {
  return `PM-${year}-${num}`;
}

function resolvePostmortemNumber(
  postmortemsDir: string,
  year: string,
  preferredNum: string,
): string {
  const preferredFilenamePrefix = `PM-${year}-${preferredNum}-`;
  if (!existsSync(postmortemsDir)) {
    return preferredNum;
  }

  const preferredTaken = readdirSync(postmortemsDir).some((name) =>
    name.startsWith(preferredFilenamePrefix),
  );
  return preferredTaken ? nextPostmortemNumber(postmortemsDir, year) : preferredNum;
}

/** Write docs/postmortems/PM-YYYY-NNN-<slug>.md linked to an existing incident report. */
export function createPostmortem(options: CreatePostmortemOptions): string {
  const { year, num: incidentNum } = parseIncidentId(options.incidentId);
  const incidentsDir = join(options.repoRoot, "docs/incident-reports");
  const postmortemsDir = join(options.repoRoot, "docs/postmortems");

  const incidentPath = findIncidentReportPath(incidentsDir, options.incidentId);
  if (incidentPath === undefined) {
    throw new Error(`incident report not found for ${options.incidentId}`);
  }

  mkdirSync(postmortemsDir, { recursive: true });

  const num = resolvePostmortemNumber(postmortemsDir, year, incidentNum);
  const pmId = postmortemId(year, num);
  const filename = postmortemFilename(year, num, options.slug);
  const filePath = join(postmortemsDir, filename);

  if (existsSync(filePath)) {
    throw new Error(`postmortem already exists: ${filePath}`);
  }

  const incidentBasename = incidentPath.split("/").pop() ?? incidentPath;

  writeFileSync(
    filePath,
    readTemplate(options.templatePath, {
      PM_ID: pmId,
      INC_ID: options.incidentId,
      TITLE: options.title,
      STATUS: options.status,
      SUMMARY: options.summary,
      DATE: options.date,
      INC_LINK: `../incident-reports/${incidentBasename}`,
    }),
    "utf8",
  );

  return filePath;
}

export function readIncidentStatus(incidentPath: string): string | undefined {
  const raw = readFileSync(incidentPath, "utf8");
  const match = /^status:\s*(\S+)/m.exec(raw);
  return match?.[1];
}

export { slugifyAdrTitle as slugifyPostmortemTitle };
