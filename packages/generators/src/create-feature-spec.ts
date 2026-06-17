#!/usr/bin/env node
import { resolve } from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { flagOrDefault, parseArgs, requireFlag } from "./lib/args.ts";
import { createFeatureSpec } from "./lib/feature-spec.ts";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Create a feature-spec scope doc (portable agent-workflow generator — doc only).
 *
 *   node create-feature-spec.ts --slug user-auth --backlog-id PROJ-1 \
 *     [--goal "Implement user sign-in"]
 */
function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const repoRoot = resolve(flagOrDefault(flags, "repo-root", process.cwd()));
  const slug = requireFlag(flags, "slug");
  const backlogId = requireFlag(flags, "backlog-id");
  const goal = flagOrDefault(flags, "goal", `Implement ${slug}`);
  const date = new Date().toISOString().slice(0, 10);

  try {
    const specPath = createFeatureSpec({
      repoRoot,
      templatePath: join(PACKAGE_ROOT, "templates/feature-spec.md"),
      slug,
      backlogId,
      goal,
      date,
    });
    console.log(`create-feature-spec: wrote ${specPath}`);
    console.log(
      "Next: fill structural/behavioral criteria and touched modules; run pnpm doc-lint.",
    );
  } catch (error) {
    console.error(`create-feature-spec: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

main();
