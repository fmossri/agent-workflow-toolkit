/** True when the process appears to be running inside Cursor (IDE agent or extension). */
export function isCursorEnvironment(): boolean {
  const agent = process.env.CURSOR_AGENT;
  if (agent === "1" || agent === "true") return true;
  if (process.env.CURSOR_TRACE_ID !== undefined && process.env.CURSOR_TRACE_ID.length > 0) {
    return true;
  }
  if (process.env.CURSOR_EXTENSION_HOST_ROLE === "agent-exec") return true;
  return false;
}

export function shouldScaffoldCursor(
  flags: Readonly<Record<string, string | true>>,
): boolean {
  if (flags["no-cursor"] === true) return false;
  if (flags["with-cursor"] === true) return true;
  return isCursorEnvironment();
}
