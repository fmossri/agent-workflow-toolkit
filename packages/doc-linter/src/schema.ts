import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import Ajv2020Module, { type AnySchemaObject, type ErrorObject } from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";

// ajv and ajv-formats are CommonJS modules with a dual `module.exports = X;
// exports.default = X` shape. Under NodeNext + verbatimModuleSyntax the default
// import is typed as the module namespace, so reach through `.default` for the
// constructor/function. This mirrors the runtime value and keeps the types honest
// without resorting to `require` (which `erasableSyntaxOnly` + node type-stripping
// forbid).
const Ajv2020 = Ajv2020Module.default;
const addFormats = addFormatsModule.default;

const schemaPath = fileURLToPath(new URL("../front-matter.schema.json", import.meta.url));
const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as AnySchemaObject;

const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);
const validate = ajv.compile(schema);

function formatError(error: ErrorObject): string {
  const { keyword, params, instancePath, message } = error;

  if (keyword === "required") {
    return `missing required field "${String(params.missingProperty)}"`;
  }
  if (keyword === "additionalProperties") {
    return `unexpected field "${String(params.additionalProperty)}"`;
  }

  const where = instancePath ? `${instancePath.replace(/^\//, "").replace(/\//g, ".")} ` : "";
  if (keyword === "enum" && Array.isArray(params.allowedValues)) {
    return `${where}${message ?? "is invalid"}: ${(params.allowedValues as unknown[]).join(", ")}`;
  }
  return `${where}${message ?? "is invalid"}`;
}

/**
 * Validate a front-matter mapping against the JSON Schema (AF-7). Returns a list
 * of human-readable problems; an empty list means the front-matter conforms.
 */
export function validateFrontMatter(data: unknown): string[] {
  if (validate(data)) {
    return [];
  }
  const errors: ErrorObject[] = validate.errors ?? [];
  return [
    ...new Set(
      errors
        // Drop the umbrella "must match 'then' schema" wrapper: the concrete
        // sub-errors (missing field, bad enum, …) are reported on their own.
        .filter((error) => error.keyword !== "if")
        .map(formatError),
    ),
  ];
}
