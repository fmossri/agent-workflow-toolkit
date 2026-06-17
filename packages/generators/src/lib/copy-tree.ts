import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

import { fillTemplate, type TemplateVars } from "./template.ts";

const TEXT_EXTENSIONS = new Set([".md", ".mdc", ".txt", ".json", ".yaml", ".yml"]);

export interface CopyTreeResult {
  readonly created: readonly string[];
  readonly skipped: readonly string[];
}

export interface CopyTreeOptions {
  /** When true (default), do not overwrite files that already exist at the destination. */
  readonly skipExisting?: boolean;
}

function isTextFile(name: string): boolean {
  const dot = name.lastIndexOf(".");
  if (dot === -1) return false;
  return TEXT_EXTENSIONS.has(name.slice(dot));
}

/** Recursively copy `srcDir` into `destDir`, filling placeholders in text files. */
export function copyTreeWithTemplates(
  srcDir: string,
  destDir: string,
  vars: TemplateVars,
  options: CopyTreeOptions = {},
): CopyTreeResult {
  const skipExisting = options.skipExisting ?? true;
  const created: string[] = [];
  const skipped: string[] = [];

  if (!existsSync(srcDir)) {
    throw new Error(`template directory not found: ${srcDir}`);
  }

  function walk(currentSrc: string, currentDest: string): void {
    for (const entry of readdirSync(currentSrc)) {
      const srcPath = join(currentSrc, entry);
      const destPath = join(currentDest, entry);
      const stat = statSync(srcPath);

      if (stat.isDirectory()) {
        mkdirSync(destPath, { recursive: true });
        walk(srcPath, destPath);
        continue;
      }

      const rel = relative(destDir, destPath);
      if (skipExisting && existsSync(destPath)) {
        skipped.push(rel);
        continue;
      }

      mkdirSync(dirname(destPath), { recursive: true });
      if (isTextFile(entry)) {
        writeFileSync(destPath, fillTemplate(readFileSync(srcPath, "utf8"), vars), "utf8");
      } else {
        cpSync(srcPath, destPath);
      }
      created.push(rel);
    }
  }

  walk(srcDir, destDir);
  return { created, skipped };
}
