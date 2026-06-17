export interface ParsedArgs {
  readonly positional: readonly string[];
  readonly flags: Readonly<Record<string, string | true>>;
}

/** Minimal CLI flag parser: `--key value`, `--key=value`, `--flag`. */
export function parseArgs(argv: readonly string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) continue;

    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }

    const eq = arg.indexOf("=");
    if (eq !== -1) {
      flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      continue;
    }

    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags[key] = next;
      i++;
    } else {
      flags[key] = true;
    }
  }

  return { positional, flags };
}

export function requireFlag(flags: Readonly<Record<string, string | true>>, name: string): string {
  const value = flags[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`missing required flag: --${name}`);
  }
  return value;
}

export function flagOrDefault(
  flags: Readonly<Record<string, string | true>>,
  name: string,
  defaultValue: string,
): string {
  const value = flags[name];
  return typeof value === "string" && value.length > 0 ? value : defaultValue;
}
