# Changelog

## 0.3.2 — 2026-07-27

### Changed

- **Widened `@gege-mn/mongol-bichig` to `^0.2.0`** (from `^0.1.0`). A caret on
  a `0.x` version pins the minor, so the old range could not resolve 0.2.0 at
  all. Without this the family splits: a project installing both this package
  and `@gege-mn/gege-converter` — which requires `^0.2.0` — would get **two
  copies of the canonical data**, and `toScript` would resolve to different
  bytes depending on the import path. That is the exact drift mongol-bichig
  exists to prevent.

### Compatibility

No behaviour change. This package imports the character classes and the suffix
registry (`cp`, `FVS`, `harmonyOf`, `isMongolLetter`, `MVS`, `NNBSP`,
`prevBaseCp`, `connectorSuffixes`, `spaceParticles`) and none of the
romanization functions that 0.2.0 altered, so the bump is inert here. No rule
was added, removed, renamed or retuned; no diagnostic code, message, severity
or offset changes. Every one of the 55 tests passes unmodified.

Released ahead of `@gege-mn/gege-converter` 0.1.0 specifically so the
duplicate-dependency window never opens.

## 0.3.1 and earlier

Not recorded here — this file starts at 0.3.2. See the git history.
