import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { readTemplate } from "./template.ts";

export interface CreateFeatureSpecOptions {
  readonly repoRoot: string;
  readonly templatePath: string;
  readonly slug: string;
  readonly backlogId: string;
  readonly goal: string;
  readonly date: string;
}

const SLUG_RE = /^[a-z][a-z0-9-]*$/;

export function validateFeatureSpecSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

/** Write docs/specs/features/<slug>.md from the portable feature-spec template. */
export function createFeatureSpec(options: CreateFeatureSpecOptions): string {
  if (!validateFeatureSpecSlug(options.slug)) {
    throw new Error("slug must be kebab-case (e.g. user-auth)");
  }

  const featureSpecDir = join(options.repoRoot, "docs/specs/features");
  mkdirSync(featureSpecDir, { recursive: true });
  const specPath = join(featureSpecDir, `${options.slug}.md`);

  if (existsSync(specPath)) {
    throw new Error(`feature spec already exists: ${specPath}`);
  }

  writeFileSync(
    specPath,
    readTemplate(options.templatePath, {
      SLUG: options.slug,
      BACKLOG_ID: options.backlogId,
      GOAL: options.goal,
      DATE: options.date,
    }),
    "utf8",
  );

  return specPath;
}
