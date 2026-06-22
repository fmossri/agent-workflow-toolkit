import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { extractFrontMatter } from "./frontmatter.ts";
import type { Problem } from "./types.ts";

const INCIDENT_FILE_RE = /^INC-(\d{4})-(\d{3})-.+\.md$/;
const POSTMORTEM_FILE_RE = /^PM-(\d{4})-(\d{3})-.+\.md$/;

interface IncidentDoc {
  readonly filename: string;
  readonly id: unknown;
}

interface PostmortemDoc {
  readonly filename: string;
  readonly id: unknown;
  readonly incidentId: unknown;
}

function readIncidentDocs(incidentsDir: string): IncidentDoc[] {
  if (!existsSync(incidentsDir)) {
    return [];
  }

  return readdirSync(incidentsDir)
    .filter((name) => INCIDENT_FILE_RE.test(name))
    .map((filename) => {
      const { data } = extractFrontMatter(readFileSync(join(incidentsDir, filename), "utf8"));
      return { filename, id: data?.id };
    });
}

function readPostmortemDocs(postmortemsDir: string): PostmortemDoc[] {
  if (!existsSync(postmortemsDir)) {
    return [];
  }

  return readdirSync(postmortemsDir)
    .filter((name) => POSTMORTEM_FILE_RE.test(name))
    .map((filename) => {
      const { data } = extractFrontMatter(readFileSync(join(postmortemsDir, filename), "utf8"));
      return { filename, id: data?.id, incidentId: data?.incident_id };
    });
}

function expectedIncidentId(filename: string): string | null {
  const match = INCIDENT_FILE_RE.exec(filename);
  if (match?.[1] === undefined || match[2] === undefined) {
    return null;
  }
  return `INC-${match[1]}-${match[2]}`;
}

function expectedPostmortemId(filename: string): string | null {
  const match = POSTMORTEM_FILE_RE.exec(filename);
  if (match?.[1] === undefined || match[2] === undefined) {
    return null;
  }
  return `PM-${match[1]}-${match[2]}`;
}

/**
 * Cross-check incident reports and postmortems: front-matter ids must match
 * filenames, and each postmortem's incident_id must reference an existing
 * incident report. No index tables (ADR-0008-style search only).
 */
export function checkIncidentDocs(docsDir: string): Problem[] {
  const incidentsDir = join(docsDir, "incident-reports");
  const postmortemsDir = join(docsDir, "postmortems");
  const problems: Problem[] = [];

  const incidents = readIncidentDocs(incidentsDir);
  const incidentIds = new Set(
    incidents
      .map((doc) => (typeof doc.id === "string" ? doc.id : null))
      .filter((id): id is string => id !== null),
  );

  for (const incident of incidents) {
    const expectedId = expectedIncidentId(incident.filename);
    if (expectedId !== null && incident.id !== expectedId) {
      problems.push({
        file: join(incidentsDir, incident.filename),
        message: `front-matter id "${String(incident.id)}" does not match filename (expected "${expectedId}")`,
      });
    }
  }

  for (const postmortem of readPostmortemDocs(postmortemsDir)) {
    const expectedId = expectedPostmortemId(postmortem.filename);
    if (expectedId !== null && postmortem.id !== expectedId) {
      problems.push({
        file: join(postmortemsDir, postmortem.filename),
        message: `front-matter id "${String(postmortem.id)}" does not match filename (expected "${expectedId}")`,
      });
    }

    if (typeof postmortem.incidentId !== "string") {
      continue;
    }
    if (!incidentIds.has(postmortem.incidentId)) {
      problems.push({
        file: join(postmortemsDir, postmortem.filename),
        message: `incident_id "${postmortem.incidentId}" does not match any incident report id`,
      });
    }
  }

  return problems;
}
