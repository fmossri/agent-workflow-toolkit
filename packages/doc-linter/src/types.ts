/** A single structural problem found in a doc, reported by file and message. */
export interface Problem {
  /** Absolute path to the offending file. */
  readonly file: string;
  /** Human-readable description of what is wrong. */
  readonly message: string;
}
