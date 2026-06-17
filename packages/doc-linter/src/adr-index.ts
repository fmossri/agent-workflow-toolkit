import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { extractFrontMatter } from "./frontmatter.ts";
import type { Problem } from "./types.ts";

const ADR_FILE_RE = /^(\d{4})-.+\.md$/;
const INDEX_LINK_RE = /^\[(\d{4})\]\(([^)]+)\)$/;

interface AdrFile {
  readonly num: string;
  readonly filename: string;
  readonly id: unknown;
  readonly status: unknown;
}

interface IndexRow {
  readonly num: string;
  readonly link: string;
  readonly statusWord: string;
}

function readAdrFiles(adrDir: string): AdrFile[] {
  return readdirSync(adrDir)
    .filter((name) => ADR_FILE_RE.test(name))
    .map((filename) => {
      const num = ADR_FILE_RE.exec(filename)?.[1] ?? "";
      const { data } = extractFrontMatter(readFileSync(join(adrDir, filename), "utf8"));
      return { num, filename, id: data?.id, status: data?.status };
    });
}

// Parse the Markdown index table: rows whose first cell is a `[NNNN](file.md)` link.
function readIndexRows(readmePath: string): IndexRow[] {
  const rows: IndexRow[] = [];
  for (const line of readFileSync(readmePath, "utf8").split("\n")) {
    if (!line.includes("|")) continue;
    const cells = line.split("|").map((cell) => cell.trim());
    const linkMatch = cells[1] !== undefined ? INDEX_LINK_RE.exec(cells[1]) : null;
    if (!linkMatch) continue;
    const statusCell = cells[3] ?? "";
    rows.push({
      num: linkMatch[1] ?? "",
      link: linkMatch[2] ?? "",
      statusWord: statusCell.split(/\s+/)[0] ?? "",
    });
  }
  return rows;
}

/**
 * Cross-check the ADR index (`<docsDir>/adr/README.md`) against the ADR files:
 * every file is listed, every listed file exists, ids match filenames, and the
 * listed status matches each ADR's front-matter status. There is deliberately
 * no diary index (ADR-0008), so only ADRs are checked here.
 */
export function checkAdrIndex(docsDir: string): Problem[] {
  const adrDir = join(docsDir, "adr");
  const readmePath = join(adrDir, "README.md");
  const problems: Problem[] = [];

  if (!existsSync(adrDir) || !existsSync(readmePath)) {
    return problems;
  }

  const files = readAdrFiles(adrDir);
  const rows = readIndexRows(readmePath);
  const filesByName = new Map(files.map((file) => [file.filename, file]));
  const linkedNames = new Set(rows.map((row) => row.link));

  for (const file of files) {
    if (!linkedNames.has(file.filename)) {
      problems.push({
        file: join(adrDir, file.filename),
        message: `ADR ${file.num} is missing a row in the index (adr/README.md)`,
      });
    }
    if (file.id !== `ADR-${file.num}`) {
      problems.push({
        file: join(adrDir, file.filename),
        message: `front-matter id "${String(file.id)}" does not match filename number ${file.num} (expected "ADR-${file.num}")`,
      });
    }
  }

  for (const row of rows) {
    const file = filesByName.get(row.link);
    if (!file) {
      problems.push({
        file: readmePath,
        message: `index row [${row.num}] links to "${row.link}", which does not exist`,
      });
      continue;
    }
    if (row.num !== file.num) {
      problems.push({
        file: readmePath,
        message: `index row [${row.num}] links to "${row.link}" (number ${file.num}); the displayed number and file disagree`,
      });
    }
    if (typeof file.status === "string" && row.statusWord !== file.status) {
      problems.push({
        file: readmePath,
        message: `index status "${row.statusWord}" for ${row.link} does not match its front-matter status "${file.status}"`,
      });
    }
  }

  return problems;
}
