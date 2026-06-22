export default {
  "*.ts": ["eslint --fix", "prettier --write"],
  "*.{js,mjs,cjs,json,md,yml,yaml}": ["prettier --write"],
  // Docs structure (AF-6): front-matter schema + ADR/incident-doc sync. The linter does
  // cross-file checks and scans the whole tree, so ignore the matched filenames
  // and run it once. Prettier (above) still owns Markdown style (ADR-0009).
  "{AGENTS.md,docs/**/*.md}": () => "pnpm doc-lint",
};
