import { readFileSync } from "node:fs";

export type TemplateVars = Readonly<Record<string, string>>;

const PLACEHOLDER_RE = /\{\{([A-Z0-9_]+)\}\}/g;

/** Replace `{{KEY}}` placeholders in `content`. Missing keys are left unchanged. */
export function fillTemplate(content: string, vars: TemplateVars): string {
  return content.replace(PLACEHOLDER_RE, (_match, key: string) => vars[key] ?? `{{${key}}}`);
}

export function readTemplate(path: string, vars: TemplateVars = {}): string {
  return fillTemplate(readFileSync(path, "utf8"), vars);
}
