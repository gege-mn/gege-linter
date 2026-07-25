# gege-linter

Standalone TypeScript library, to be published on npm as
`@gege-mn/gege-linter` (bin: `gege-linter`).
Lints traditional Mongolian script (Mongol bichig) text for incorrect or
legacy Unicode usage. Born out of ~/Projects/gege.mn (the studio site, its
first consumer: the /type pad's issues panel + a CI scan of bichig string
consts) but deliberately its own project.

## Project conventions

- **pnpm**, Biome (lint + format, 2-space indent, single quotes), Vitest,
  plain `tsc` build to `dist/`. Zero runtime dependencies.
- Diagnostics use **code-point offsets** (not UTF-16 units) — matches the
  gege.mn /type pad's caret model.
- **Never type invisible characters as literals in source** (NNBSP U+202F,
  MVS U+180E, FVS1–4, ZWJ/ZWNJ): always `\uXXXX` escapes. Visible bichig
  letters may appear literally. This is a hard-won lesson — invisible
  literals get silently mistranscribed.
- **Agent skills** live in `skills/<name>/SKILL.md` (two: `mongol-bichig`
  knowledge + `gege-linter` usage), installable via
  `npx skills add L-Atelier-Gege/gege-linter`.
  `skills/mongol-bichig/references/` is a **mirror of `docs/`** — run
  `pnpm sync:skills` after any doc edit; `test/skill-refs.test.ts` fails on
  drift. The invisible-literal rule applies to skills too.
- One rule per file under `src/rules/`, registered in `src/index.ts`.
  Each rule: `{ name, check(text): Diagnostic[] }`, pure function, offers a
  `fix` string whenever the correction is mechanical. Public API: `lint`,
  `applyFixes` (code-point-safe splicing — consumers must never
  `String.slice` with diagnostic offsets), `rules`, per-rule exports, types.

## The fact base (researched 2026-07-23/25, primary sources)

Deep reference lives in **docs/** (see docs/README.md — encoding model,
history, variation sequences, script styles, suffixes, legacy encodings,
fonts/rendering, orthography). Headlines:

- **Unicode 16.0 (Sept 2024) moved the suffix-connector role from NNBSP
  (U+202F) to MVS (U+180E)** — core spec ch. 13.5, unchanged through 17.0.
  NNBSP is legacy/back-compat only. Easy to miss: not in the 16.0 release
  notes, and **zero UCD property changes** — the entire model shift is
  core-spec prose + font GSUB, so a text-level linter is the only
  enforcement layer. W3C MLREQ *re-published* the NNBSP model in July 2025
  (ten months post-16.0); cite it for layout only, never encoding.
- History nuance (docs/encoding-history.md): the 2017 dedicated
  suffix-connector proposal (L2/17-036, at U+180F) was never formally
  rejected — UTC #150 "took no action" and U+180F later became FVS4
  (Unicode 14.0). The MVS model reached Unicode via China's
  GB/T 25914—2023 (UTC consensus 180-C31). No mainstream keyboard is
  confirmed to emit MVS for suffixes yet (2026-07) — real-world text stays
  NNBSP-joined for years.
- **UTN #57** "Encoding and Shaping of the Mongolian Script" (Kushim Jiang,
  v4, 2024, unicode.org/notes/tn57/) is the authoritative shaping registry;
  implements GB/T 25914—2023. Its maintenance moved to auto-generated
  mongfontbuilder data in 2025 (site: mongfontbuilder.pages.dev); the
  unicode.org PDF is frozen at v4 — vendor the JSON, don't parse the PDF.
- **Machine-readable data**: github.com/Kushim-Jiang/mongfontbuilder (MIT) —
  `particles.json` (47 Hudum entries — a *shaping* registry: only particles
  where some letter takes a particle-specific form; ᠪᠠᠷ/ᠲᠠᠢ/ᠲᠤᠷ/ᠡᠴᠡ etc.
  are validly absent, so it can confirm suffixes but never refute them —
  established 2026-07-25, see docs/suffixes.md which is the real dictionary),
  `variants.json` (FVS registrations; key `"0"` means context-only, NOT
  FVS0), `writtenUnits.json`. Vendor as JSON under `src/data/` with a
  provenance note; don't fetch at runtime. ⚠ For FVS validation use
  mongfontbuilder, **not** UCD `StandardizedVariants.txt` — neither is a
  superset of the other (UCD frozen since 2005/2017 with dead sequences; 68
  current MNG registrations absent from it; the core spec itself calls the
  UCD list defective) — see docs/variation-sequences.md incl. the Hudum
  valid-FVS quick table.
- **Noto Sans Mongolian v3.002** (what gege.mn self-hosts) shapes NNBSP- and
  MVS-joined suffixes byte-identically (hb-shape verified), and renders
  *misuse* visibly by design — bare MVS → visible `mvs.nominal`; lone NNBSP
  and unregistered/doubled FVS also get visible marker glyphs. The MVS glyph
  is three glyphs: `mvs.narrow` (chachlag) / `mvs.wide` (suffix connector) /
  `mvs.nominal` (misuse). Meanwhile Windows (Baiti 5.53) and Android (Noto
  v1.04 from 2016!) still ship pre-model fonts — docs/fonts-and-rendering.md.
- No off-the-shelf Mongolian encoding linter existed as of 2026-07 — this is
  the first.

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

Tier 2 — data-driven (vendor mongfontbuilder JSON first):
7. `unknown-suffix` — connector followed by a sequence not in the curated
   63-entry suffix dictionary (warn, not error).
8. `space-before-suffix` — plain U+0020 before a known suffix ("did you mean
   MVS?") — the exact bug found by hand in gege.mn's footer.
9. `fvs-unregistered` — (letter, FVS) pair not in SVS/UTN #57 tables.

Tier 3 — linguistic (optional, later): vowel-harmony agreement between stem
and suffix (UTN #57 Table 5 masculine {a,o,u} vs feminine {e,ö,ü} is a decent
heuristic); full lexicon checks are spell-checker territory — out of scope.

Surfaces: the CLI is DONE (2026-07-25; `src/cli.ts`, bin `gege-linter` —
zero-dep, `--fix`/`--json`/stdin via `-`, exit 1 only on error severity;
`runCli` is exported for tests). An ESLint plugin wrapper remains a
possible later surface; keep the core pure and dependency-free either way.

## Relationship to gege-engine

~/Projects/gege-engine (uncommitted, unpublished scaffold) models legacy
*font* encodings — Menksoft PUA / CMs ASCII glyph tables extracted from font
binaries. Different problem (glyphs, not text validity); do NOT depend on it.
Its PUA tables become useful only for rule 4's fix suggestions, and would be
vendored as data if so.
