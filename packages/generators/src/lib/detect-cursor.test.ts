import { describe, expect, it } from "vitest";

import { isCursorEnvironment, shouldScaffoldCursor } from "./detect-cursor.ts";

describe("detect-cursor", () => {
  it("detects Cursor agent environment variables", () => {
    const prev = process.env.CURSOR_AGENT;
    process.env.CURSOR_AGENT = "1";
    expect(isCursorEnvironment()).toBe(true);
    process.env.CURSOR_AGENT = prev;
  });

  it("defaults to Cursor scaffold in Cursor unless --no-cursor", () => {
    const prev = process.env.CURSOR_AGENT;
    process.env.CURSOR_AGENT = "1";
    expect(shouldScaffoldCursor({})).toBe(true);
    expect(shouldScaffoldCursor({ "no-cursor": true })).toBe(false);
    process.env.CURSOR_AGENT = prev;
  });

  it("requires --with-cursor outside Cursor", () => {
    const prevAgent = process.env.CURSOR_AGENT;
    const prevTrace = process.env.CURSOR_TRACE_ID;
    delete process.env.CURSOR_AGENT;
    delete process.env.CURSOR_TRACE_ID;
    expect(shouldScaffoldCursor({})).toBe(false);
    expect(shouldScaffoldCursor({ "with-cursor": true })).toBe(true);
    process.env.CURSOR_AGENT = prevAgent;
    process.env.CURSOR_TRACE_ID = prevTrace;
  });
});
