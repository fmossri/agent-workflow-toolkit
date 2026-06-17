import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { readTemplate } from "./template.ts";

const ADR_FILE_RE = /^(\d{4})-.+\.md$/;

export interface CreateAdrOptions {
  readonly adrDir: string;
  readonly templatePath: string;
  readonly title: string;
  readonly slug: string;
  readonly status: "Proposed" | "Accepted" | "Superseded" | "Deprecated";
  readonly date: string;
  readonly deciders: string;
}

export function nextAdrNumber(adrDir: string): string {
  if (!existsSync(adrDir)) {
    return "0001";
  }

  let max = 0;
  for (const name of readdirSync(adrDir)) {
    const match = ADR_FILE_RE.exec(name);
    if (match?.[1] !== undefined) {
      max = Math.max(max, Number.parseInt(match[1], 10));
    }
  }
  return String(max + 1).padStart(4, "0");
}

function insertIndexRow(
  readmeContent: string,
  num: string,
  filename: string,
  title: string,
  status: string,
): string {
  const row = `| [${num}](${filename}) | ${title} | ${status} |`;
  const lines = readmeContent.split("\n");
  const headerIdx = lines.findIndex((line) => line.includes("| #") && line.includes("| Title"));
  if (headerIdx === -1) {
    throw new Error("could not find ADR index table header in adr/README.md");
  }

  // Insert after the separator row (header + separator).
  const insertAt = headerIdx + 2;
  lines.splice(insertAt, 0, row);
  return lines.join("\n");
}

export function createAdr(options: CreateAdrOptions): {
  readonly num: string;
  readonly filePath: string;
} {
  const num = nextAdrNumber(options.adrDir);
  const filename = `${num}-${options.slug}.md`;
  const filePath = join(options.adrDir, filename);

  if (existsSync(filePath)) {
    throw new Error(`ADR file already exists: ${filename}`);
  }

  const body = readTemplate(options.templatePath, {
    ADR_NUM: num,
    ADR_ID: `ADR-${num}`,
    TITLE: options.title,
    STATUS: options.status,
    DATE: options.date,
    DECIDERS: options.deciders,
  });

  writeFileSync(filePath, body, "utf8");

  const readmePath = join(options.adrDir, "README.md");
  const readme = readFileSync(readmePath, "utf8");
  writeFileSync(
    readmePath,
    insertIndexRow(readme, num, filename, options.title, options.status),
    "utf8",
  );

  return { num, filePath };
}

/** Strip characters unsafe in ADR filenames; collapse to kebab-case. */
export function slugifyAdrTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
