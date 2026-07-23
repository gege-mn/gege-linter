# gege-linter

Standalone TypeScript library, to be published on npm as `gege-linter`.
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
- One rule per file under `src/rules/`, registered in `src/index.ts`.
  Each rule: `{ name, check(text): Diagnostic[] }`, pure function, offers a
  `fix` string whenever the correction is mechanical. Public API: `lint`,
  `applyFixes` (code-point-safe splicing — consumers must never
  `String.slice` with diagnostic offsets), `rules`, per-rule exports, types.

## The fact base (researched 2026-07-23, primary sources)

- **Unicode 16.0 (Sept 2024) moved the suffix-connector role from NNBSP
  (U+202F) to MVS (U+180E)** — core spec ch. 13.5. NNBSP is legacy/back-compat
  only. Easy to miss: not in the 16.0 release notes. W3C MLREQ (still
  NNBSP-based) lags the standard.
- **UTN #57** "Encoding and Shaping of the Mongolian Script" (Kushim Jiang,
  v4, 2024, unicode.org/notes/tn57/) is the authoritative shaping registry;
  implements GB/T 25914—2023.
- **Machine-readable data**: github.com/Kushim-Jiang/mongfontbuilder (MIT) —
  `particles.json` (closed 47-entry Hudum suffix dictionary),
  `variants.json` (FVS registrations), `writtenUnits.json`. Also UCD
  `StandardizedVariants.txt` (60 Mongolian SVS, FVS1–3) and CLDR `mn_Mong`
  exemplars (U+1820–1842 = modern Hudum alphabet). Vendor these as JSON under
  `src/data/` with a provenance note; don't fetch at runtime.
- **Noto Sans Mongolian v3.002** (what gege.mn self-hosts) shapes NNBSP- and
  MVS-joined suffixes byte-identically (hb-shape verified), and renders
  *misuse* visibly by design (bare MVS → wide `mvs.nominal` glyph).
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
   U+1878 (Hudum extension) deliberately not flagged.
6. `zwj-zwnj` — DONE. Flagged only when adjacent to a Mongolian letter, so
   emoji ZWJ sequences never false-positive → warning.

Bonus (user request, 2026-07-23): `non-initial-o` — DONE. Dumb
vowel-position heuristic at info severity: O/Ö (U+1823/1825) after the
word's first vowel; MVS/NNBSP/nirugu/FVS count as word-internal. Info on
purpose — ᠮᠣᠩᠭᠣᠯ itself is a legitimate native exception.

Tier 2 — data-driven (vendor mongfontbuilder JSON first):
7. `unknown-suffix` — connector followed by a sequence not in the 47-entry
   particle dictionary (warn, not error).
8. `space-before-suffix` — plain U+0020 before a known suffix ("did you mean
   MVS?") — the exact bug found by hand in gege.mn's footer.
9. `fvs-unregistered` — (letter, FVS) pair not in SVS/UTN #57 tables.

Tier 3 — linguistic (optional, later): vowel-harmony agreement between stem
and suffix (UTN #57 Table 5 masculine {a,o,u} vs feminine {e,ö,ü} is a decent
heuristic); full lexicon checks are spell-checker territory — out of scope.

Possible later surfaces: a tiny CLI (`gege-linter <file>`) and an ESLint
plugin wrapper; keep the core pure and dependency-free either way.

## Relationship to gege-engine

~/Projects/gege-engine (uncommitted, unpublished scaffold) models legacy
*font* encodings — Menksoft PUA / CMs ASCII glyph tables extracted from font
binaries. Different problem (glyphs, not text validity); do NOT depend on it.
Its PUA tables become useful only for rule 4's fix suggestions, and would be
vendored as data if so.
