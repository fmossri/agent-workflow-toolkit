import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Root `package.json` scripts merged by scaffold-docs (only missing keys). */
export const TOOLKIT_PACKAGE_SCRIPTS: Readonly<Record<string, string>> = {
  "doc-lint": "tsx node_modules/@agent-workflow/doc-linter/src/cli.ts",
  "gen:scaffold-docs":
    "tsx node_modules/@agent-workflow/generators/src/scaffold-docs-structure.ts",
  "gen:create-adr": "tsx node_modules/@agent-workflow/generators/src/create-adr.ts",
  "gen:diary-entry": "tsx node_modules/@agent-workflow/generators/src/add-diary-entry.ts",
  "gen:create-feature-spec":
    "tsx node_modules/@agent-workflow/generators/src/create-feature-spec.ts",
};

export interface WirePackageScriptsResult {
  readonly added: readonly string[];
  readonly skipped: readonly string[];
  readonly warnings: readonly string[];
}

export function wirePackageScripts(targetDir: string): WirePackageScriptsResult {
  const packageJsonPath = join(targetDir, "package.json");
  const added: string[] = [];
  const skipped: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(packageJsonPath)) {
    warnings.push(
      "no package.json at target — skipped script wiring; run pnpm init then re-run scaffold or add gen:* scripts manually",
    );
    return { added, skipped, warnings };
  }

  const raw = readFileSync(packageJsonPath, "utf8");
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error(`wire-package-scripts: invalid JSON in ${packageJsonPath}`);
  }

  const scripts =
    typeof pkg.scripts === "object" && pkg.scripts !== null && !Array.isArray(pkg.scripts)
      ? { ...(pkg.scripts as Record<string, string>) }
      : {};

  for (const [name, command] of Object.entries(TOOLKIT_PACKAGE_SCRIPTS)) {
    if (name in scripts) {
      skipped.push(name);
    } else {
      scripts[name] = command;
      added.push(name);
    }
  }

  const devDeps =
    typeof pkg.devDependencies === "object" &&
    pkg.devDependencies !== null &&
    !Array.isArray(pkg.devDependencies)
      ? (pkg.devDependencies as Record<string, string>)
      : {};

  if (!("tsx" in devDeps)) {
    warnings.push(
      'devDependency "tsx" not found — install with: pnpm add -D tsx (required to run gen:* and doc-lint scripts)',
    );
  }

  if (added.length > 0) {
    pkg.scripts = scripts;
    writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  }

  return { added, skipped, warnings };
}
