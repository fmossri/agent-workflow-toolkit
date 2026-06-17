import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { Problem } from "./types.ts";

interface Heading {
  readonly level: number;
}

const FENCE_RE = /^\s*(`{3,}|~{3,})/;
const ATX_HEADING_RE = /^(#{1,6})\s+\S/;
const INLINE_CODE_RE = /`[^`]*`/g;
const INLINE_LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;
const URL_SCHEME_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

interface ScannedBody {
  readonly headings: Heading[];
  readonly linkTargets: string[];
}

/**
 * Scan a Markdown body for ATX headings and inline-link targets, ignoring
 * anything inside fenced code blocks (e.g. the ADR template in adr/README.md)
 * and inline code spans. Style is out of scope — this only extracts structure.
 */
function scanBody(body: string): ScannedBody {
  const headings: Heading[] = [];
  const linkTargets: string[] = [];

  let fenceMarker: string | null = null;
  for (const line of body.split("\n")) {
    const fence = FENCE_RE.exec(line);
    if (fence) {
      const marker = (fence[1] ?? "")[0] ?? "";
      if (fenceMarker === null) {
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        fenceMarker = null;
      }
      continue;
    }
    if (fenceMarker !== null) {
      continue;
    }

    const heading = ATX_HEADING_RE.exec(line);
    if (heading) {
      headings.push({ level: (heading[1] ?? "").length });
    }

    const prose = line.replace(INLINE_CODE_RE, "");
    for (const link of prose.matchAll(INLINE_LINK_RE)) {
      linkTargets.push(link[1] ?? "");
    }
  }

  return { headings, linkTargets };
}

function normalizeLinkTarget(raw: string): string | null {
  let target = raw.trim();
  if (target.startsWith("<") && target.endsWith(">")) {
    target = target.slice(1, -1).trim();
  }
  // Drop an optional link title: [text](path "title").
  target = target.split(/\s+/)[0] ?? "";
  // Strip the #fragment; a pure in-page anchor has nothing left to resolve.
  target = target.split("#")[0] ?? "";
  if (target === "" || URL_SCHEME_RE.test(target)) {
    return null;
  }
  return target;
}

/**
 * Structural checks on a Markdown body that the front-matter schema can't
 * express: exactly one top-level H1 (and it comes first), and every relative
 * link resolves to a file that exists (markdownlint and Prettier never did the
 * latter — broken relative ADR links have bitten this repo before).
 */
export function checkBody(file: string, body: string): Problem[] {
  const problems: Problem[] = [];
  const { headings, linkTargets } = scanBody(body);

  const h1Count = headings.filter((heading) => heading.level === 1).length;
  if (h1Count !== 1) {
    problems.push({
      file,
      message: `must have exactly one top-level "# " heading (found ${String(h1Count)})`,
    });
  } else if (headings[0]?.level !== 1) {
    problems.push({ file, message: 'the first heading must be the top-level "# " heading' });
  }

  const baseDir = dirname(file);
  for (const raw of linkTargets) {
    const target = normalizeLinkTarget(raw);
    if (target === null) {
      continue;
    }
    let decoded = target;
    try {
      decoded = decodeURI(target);
    } catch {
      // Malformed percent-encoding: fall back to the raw target.
    }
    if (!existsSync(resolve(baseDir, decoded))) {
      problems.push({ file, message: `broken relative link "${target}" (file not found)` });
    }
  }

  return problems;
}
