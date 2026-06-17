import { parse as parseYaml } from "yaml";

/** Result of pulling the YAML front-matter block off a Markdown file. */
export interface ParsedFrontMatter {
  /** The parsed mapping, or `null` when extraction failed. */
  readonly data: Record<string, unknown> | null;
  /** A failure reason, or `null` when extraction succeeded. */
  readonly error: string | null;
  /** The Markdown body after the front-matter block (empty when extraction failed). */
  readonly body: string;
}

// A leading `---` line, the YAML body, then a closing `---` line.
const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/**
 * Extract and parse the YAML front-matter from a Markdown document. Validates
 * only that a mapping is present and parseable; field-level checks live in the
 * JSON Schema (see `schema.ts`).
 */
export function extractFrontMatter(content: string): ParsedFrontMatter {
  const match = FRONT_MATTER_RE.exec(content);
  if (!match) {
    return {
      data: null,
      error: "missing YAML front-matter (the file must start with a '---' block)",
      body: "",
    };
  }

  const body = content.slice(match[0].length);

  let parsed: unknown;
  try {
    parsed = parseYaml(match[1] ?? "");
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { data: null, error: `invalid YAML front-matter: ${reason}`, body };
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { data: null, error: "front-matter is not a YAML mapping", body };
  }

  return { data: parsed as Record<string, unknown>, error: null, body };
}
