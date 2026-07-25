# gege-linter

Standalone TypeScript library, to be published on npm as
`@gege-mn/gege-linter` (bin: `gege-linter`).
Lints traditional Mongolian script (Mongol bichig) text for incorrect or
legacy Unicode usage. Born out of ~/Projects/gege.mn (the studio site, its
first consumer: the /type pad's issues panel + a CI scan of bichig string
consts) but deliberately its own project.

## Project conventions

- **pnpm**, Biome (lint + format, 2-space indent, single quotes), Vitest,
  plain `tsc` build to `dist/`. **No third-party runtime dependencies** — the
  single dependency is `@gege-mn/mongol-bichig`, first-party, pure data and
  pure functions, itself dependency-free.
- Diagnostics use **code-point offsets** (not UTF-16 units) — matches the
  gege.mn /type pad's caret model.
- **Never type invisible characters as literals in source** (NNBSP U+202F,
  MVS U+180E, FVS1–4, ZWJ/ZWNJ): always `\uXXXX` escapes. Visible bichig
  letters may appear literally. This is a hard-won lesson — invisible
  literals get silently mistranscribed.
- **Agent skills and the knowledge base are NOT in this repo** (moved
  2026-07-26). Both live in ~/Projects/mongol-bichig →
  `npx skills add gege-mn/mongol-bichig`. Edit the linter's usage skill
  there, at `skills/gege-linter/SKILL.md` — nothing here enforces that it
  stays in step with the code, so a rule rename means remembering to
  update it.
- One rule per file under `src/rules/`, registered in `src/index.ts`.
  Each rule: `{ name, check(text): Diagnostic[] }`, pure function, offers a
  `fix` string whenever the correction is mechanical. Public API: `lint`,
  `applyFixes` (code-point-safe splicing — consumers must never
  `String.slice` with diagnostic offsets), `rules`, per-rule exports, types.

## The fact base — lives in ~/Projects/mongol-bichig

**Do not re-derive script facts here, and do not copy them back into this
repo.** The nine source-cited reference documents, the pinned provenance
(`sources.md`) and the canonical suffix registry all live in
[mongol-bichig](https://github.com/gege-mn/mongol-bichig). Install the skill
(`npx skills add gege-mn/mongol-bichig`) and read `references/` on demand —
that is the efficient path, and it is the only copy.

The four facts that shape *this* codebase's decisions, so they are worth
having without a lookup:

- **Unicode 16.0 (Sept 2024) moved the suffix connector from NNBSP (U+202F)
  to MVS (U+180E)** — core spec ch. 13.5, unchanged through 17.0. It changed
  **zero UCD properties** and is absent from the release notes: the whole
  model lives in core-spec prose and font GSUB, which is why a text-level
  linter is the only enforcement layer that can exist. This project is the
  first such linter (none existed as of 2026-07).
- **Looking right proves nothing.** NNBSP- and MVS-joined suffixes shape
  byte-identically in Noto v3.002. Only the bytes differ — so every check
  here must read code points, never rendering.
- **No keyboard or IME emits MVS yet** (2026-07). Real-world input stays
  NNBSP-joined for years, which is why `nnbsp-legacy` is a *warning* with a
  mechanical fix rather than an error.
- **For FVS validation use mongfontbuilder, not UCD
  `StandardizedVariants.txt`** — neither is a superset of the other, and the
  core spec itself calls the UCD list defective. Details and the Hudum
  valid-FVS table: `references/variation-sequences.md`.

The suffix dictionary is **not this repo's data** — it is
`connectorSuffixes` from `@gege-mn/mongol-bichig`, whose normative source is
`references/suffixes.md` over there, cross-checked row by row by a test in
that repository. A suffix correction belongs there, not here; it then
reaches the convertor too.

## Rule roadmap

Tier 1 — pure sequence checks, no data files — ALL DONE (2026-07-23):
1. `nnbsp-legacy` — DONE (first rule, sets the pattern).
2. `mvs-context` — DONE. MVS not between two Mongolian letters → error.
3. `fvs-placement` — DONE. FVS1–4 (U+180B–180D, U+180F) not directly after
   a Mongolian letter (doubling fails the same test) → error.
4. `no-pua` — DONE. U+E000–F8FF, contiguous runs grouped into one
   diagnostic → error. gege-engine's PUA tables can later power "suggest
   the Unicode equivalent" fixes.
5. `wrong-block` — DONE. Todo (U+1843–185C) / Sibe (U+185D–1872) / Manchu
   (U+1873–1877) / Ali Gali (U+1880–18AA) in Hudum text → warning; the
   Tungaamal look-alikes U+1888/U+1889 carry mechanical fixes to ᠬ/ᠭ;
   U+1878 (chart-classified "Buryat letter", Unicode 11.0 — Hudum-sphere)
   deliberately not flagged. U+1879 ALTERNATE UE is pipeline-limbo
   (accepted 2025, reverted 2026) — treat as unassigned, may return.
6. `zwj-zwnj` — DONE. Flagged only when adjacent to a Mongolian letter, so
   emoji ZWJ sequences never false-positive → warning.

Bonus (user request, 2026-07-23): `non-initial-o` — DONE. Dumb
vowel-position heuristic at info severity: O/Ö (U+1823/1825) after the
word's first vowel; MVS/NNBSP/nirugu/FVS count as word-internal. Info on
purpose — ᠮᠣᠩᠭᠣᠯ itself is a legitimate native exception.

Tier 2 — data-driven (the data lives in `@gege-mn/mongol-bichig`):
7. `unknown-suffix` — DONE. Connector followed by a sequence not in the
   63-entry `connectorSuffixes` registry (warn, not error).
8. `space-before-suffix` — plain U+0020 before a known suffix ("did you mean
   MVS?") — the exact bug found by hand in gege.mn's footer. The package
   already ships what this needs: `spaceParticles` (ᠤᠤ/ᠦᠦ/ᠪᠦᠦ/ᠦᠭᠡᠢ) is the
   whitelist — a space before those is *correct* and an MVS is the error.
9. `fvs-unregistered` — (letter, FVS) pair not in SVS/UTN #57 tables.
   Blocked on vendoring mongfontbuilder's `variants.json` **into
   mongol-bichig** (open item recorded in that repo's `sources.md`), not
   here.

Tier 3 — linguistic (optional, later): vowel-harmony agreement between stem
and suffix (UTN #57 Table 5 masculine {a,o,u} vs feminine {e,ö,ü} is a decent
heuristic); full lexicon checks are spell-checker territory — out of scope.

Surfaces: the CLI is DONE (2026-07-25; `src/cli.ts`, bin `gege-linter` —
`--fix`/`--json`/stdin via `-`, exit 1 only on error severity; `runCli` is
exported for tests). An ESLint plugin wrapper remains a possible later
surface; keep the core pure and free of *third-party* dependencies either
way.

## Sibling projects

- **~/Projects/mongol-bichig** — the shared source of truth: canonical data
  (`@gege-mn/mongol-bichig`), the reference documents, and both agent skills.
  Suffix or script-fact corrections go there.
- **~/Projects/gege-convertor** — `@gege-mn/gege-convertor`, Cyrillic →
  bichig. The inverse problem: this validates text, that generates it. It
  will consume the same package. Its stage 8 takes `lint` from here as an
  injected hook, so it depends on this package but this one never depends
  on it.

## Relationship to gege-engine

~/Projects/gege-engine (uncommitted, unpublished scaffold) models legacy
*font* encodings — Menksoft PUA / CMs ASCII glyph tables extracted from font
binaries. Different problem (glyphs, not text validity); do NOT depend on it.
Its PUA tables become useful only for rule 4's fix suggestions, and would be
vendored as data if so.
