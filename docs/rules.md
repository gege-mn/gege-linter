# The rule inventory and roadmap

<!-- Background doc. CLAUDE.md points here; it is NOT loaded into context
automatically. -->

Read this when adding, renaming, or changing a rule, when deciding a
severity, or when picking up the next piece of work.

## Rules, tier by tier

Tier 1 — pure sequence checks, no data files — ALL DONE (2026-07-23):
1. `nnbsp-legacy` — DONE (first rule, sets the pattern). It is a **warning
   with a mechanical fix, not an error**, because **no keyboard or IME emits
   MVS yet** (as of 2026-07). Real-world input stays NNBSP-joined for years,
   so erroring on it would flag essentially every honestly-typed document.
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
word's first vowel; MVS/NNBSP/nirugu/FVS count as word-internal.

**The rule is categorical — ᠮᠣᠩᠭᠣᠯ is a real hit, not an exception**
(corrected 2026-07-26; these notes previously claimed the opposite). The
correct spelling is ᠮᠣᠩᠭᠤᠯ, `mongγul`. Two independent confirmations: a
bichig reader ruled on it, quoting the school rule that after the first
syllable masculine words take у and feminine ү; and Tungaamal applies
the rule throughout its own output (ᠪᠣᠭᠤᠨᠢ, ᠣᠷᠤᠢ, ᠲᠣᠭᠤᠭ᠎ᠠ), exempting
this one word alone. Severity stays **info** regardless, because loanwords
keep their o (ᠹᠣᠲᠣ, ᠻᠢᠨᠣ) and ᠭᠣᠣᠯ is a genuine lexical exception with a
doubled short o.

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
   here. **Validate against mongfontbuilder, not UCD
   `StandardizedVariants.txt`** — neither is a superset of the other, and the
   core spec itself calls the UCD list defective. The Hudum valid-FVS table
   is in mongol-bichig's `references/variation-sequences.md`.

Tier 3 — linguistic (optional, later): vowel-harmony agreement between stem
and suffix (UTN #57 Table 5 masculine {a,o,u} vs feminine {e,ö,ü} is a decent
heuristic); full lexicon checks are spell-checker territory — out of scope.

Surfaces: the CLI is DONE (2026-07-25; `src/cli.ts`, bin `gege-linter` —
`--fix`/`--json`/stdin via `-`, exit 1 only on error severity; `runCli` is
exported for tests). An ESLint plugin wrapper remains a possible later
surface; keep the core pure and free of *third-party* dependencies either
way.

## Relationship to gege-engine

~/Projects/gege-engine (uncommitted, unpublished scaffold) models legacy
*font* encodings — Menksoft PUA / CMs ASCII glyph tables extracted from font
binaries. Different problem (glyphs, not text validity); do NOT depend on it.
Its PUA tables become useful only for rule 4's fix suggestions, and would be
vendored as data if so.
