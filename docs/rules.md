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

Bonus (user request, 2026-07-27): `fusable-stack` — DONE. An analytic
(задлаг) case + reflexive stack that has a registered fused (нийлэг)
equivalent: ᠳᠤ + ᠪᠠᠨ → ᠳᠠᠭᠠᠨ, ᠳᠦ + ᠪᠡᠨ → ᠳᠡᠭᠡᠨ, and the same for
ᠲᠤ/ᠲᠦ and ᠠᠴᠠ/ᠡᠴᠡ. **Info, and deliberately with no `fix`** — both
spellings are correct, so a mechanical fix would let `--fix` rewrite an
author's style into the other valid form. The fused sequence is named in
the message; a consumer wanting one-click apply builds connector + that
sequence over the reported span. The pairing is keyed by translit and
resolved against `connectorSuffixes` at load, so this repo still holds no
copy of the dictionary's letters.

Worth surfacing on the evidence: 538 analytic stacks in 4,000 sentences of
real bichig and 76 in 31,320 words — with **zero** fused forms anywhere in
the corpus. Whatever the reason writers avoid the fused form, they are not
choosing it, and a linter that only ever complains would never tell them it
exists.

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

Two candidates promoted out of tier 3 by the 2026-07-27 spot check, both
mechanical and both with a fix:

10. `medial-glide` — vowel + ᠶ (U+1836) + ᠢ (U+1822) → drop the ᠶ. The reader
    asked for it unprompted ("1 и displays two shilbe after vowels in the new
    unicode"), and mongol-bichig's `orthography.md` independently records that
    UTN #57 prefers the modern analysis (ail, sayin → sain). Info or warning,
    never error: the V+y+i spelling is *older*, not malformed. Guard the left
    side on a **vowel letter**, not a connector — ᠶᠢᠨ/ᠢᠶᠡᠨ after MVS must not
    match. gege-converter already does this in `normalizeOrthography`, so the
    logic is worth sharing rather than reinventing.
11. `doubled-ae` — adjacent ᠠᠠ (U+1820 U+1820) or ᠡᠡ (U+1821 U+1821). Long a/e
    are never doubled; they take the γ/g hiatus, so this is a typo or a
    letter-for-letter Cyrillic artifact (`orthography.md` calls it a strong
    candidate rule at warning). 28 of the residual unknown-suffix runs in the
    harvest are exactly this, and the reader confirmed one (өтгөнөө, where the
    suffix should have been ᠢᠶᠡᠨ).

## What the 2026-07-27 spot check settled

28 items drawn at random from 31,320 words + 4,000 sentences of raw Tungaamal
output (`scripts/build-spotcheck.mjs --seed 161294890`), ruled on by a bichig
reader. Every verdict is recorded in `test/rulings.test.ts`; open ones are
`it.todo` with the correct answer written down. **Do not re-litigate them.**

Confirmed, 4 of 4 each: `nnbsp-legacy`'s NNBSP→MVS swap (and that it renders
identically in current Noto), `wrong-block`'s U+1888→ᠬ / U+1889→ᠭ, and
`unknown-suffix`'s stray-FVS drop. That last one **reverses an earlier
contradiction** — the reader had previously said the FVS spelling was the only
way they could get the font to behave; re-checked against current Noto, they
confirmed it four times. The clean group drew four words and found no misses.

Open, in rough order of how much corpus they move:

- **Bare ᠬᠢ (U+182C U+1822) is missing from the registry.** Ruled a real
  suffix twice (анчдынх, холтосныхоо — Cyrillic -ынх/-ных, the nominalizer).
  It appears in the registry only inside ᠳᠠᠬᠢ/ᠳᠡᠬᠢ. 208 of the 977
  unknown-suffix warnings that survive a full fix pass are this one sequence.
  The addition belongs in **mongol-bichig**, not here.
- **ᠳᠠᠬᠢ/ᠳᠡᠬᠢ: reader and reference disagree.** `suffixes.md` lists them as
  registry-confirmed fused suffixes taking MVS; the reader says дахь/дэх is a
  separate word taking a plain space. Unresolved — settle it in mongol-bichig
  against the source, not by editing either side here.
- **`non-initial-o` fires on loanwords.** Both info hits were ruled "loanword,
  should be exempt", with the general rule stated: foreign words may carry o/ö
  after the first syllable. Partially fixable — рационализмаар carries ᠼ
  (U+183C), a foreign-only letter — but лантаноид is spelled entirely with
  native letters and cannot be detected this way. Severity stays info.
- **`fvs-placement`'s error severity is unconfirmed.** The one error in the
  whole corpus (редакторлах, a doubled FVS1) was ruled a false alarm — but on
  a misreading, because the old message did not say the selector had landed on
  another selector. The message now names what it landed on; re-ask before
  changing severity.
- **`zwj-zwnj` is unruled.** Both draws were abbreviations (ЗХУ, ЕХ) with ZWJ
  holding a non-final form before U+1802. The reader could not rule on them.
- **Rule 8 has real-world evidence now.** холтосныхоо, агаар мандал дахь… and
  Магадгүй… all write the genitive ᠤ as a separate token after a plain U+0020,
  and the linter says nothing. Not rare in the corpus.

Residual `unknown-suffix` runs, after a full fix-and-re-lint pass over the
whole corpus, are dominated by six sequences — ᠯᠡ/ᠯᠠ (465), ᠬᠢ (208), ᠰᠢᠭ
(121), ᠠᠠ/ᠡᠡ (88), ᠤᠷᠤᠭᠤ (65), ᠰᠠᠨ (15) — together 98% of the 977 that
survive. `scripts/build-sequence-check.mjs` asks one ruling per sequence.

## The sequence check, and what sources say about it

All six were ruled on 2026-07-27 and then checked against outside sources,
because five of the six answers were "separate word", which is a large claim
about shared data. Verdicts are in `test/rulings.test.ts`.

**The decisive source is L2/17-036 Appendix IV**, "Mongolian suffixes as
connected by NNBSP" — the 2017 proposal that produced U+180F, by Eck, West,
Sanlig, Siqinbilige and Ou Rileke. It is the only enumerated connector
inventory anyone has published. Diffing its 57 entries against our 63:

- **ᠬᠢ (U+182C U+1822) and ᠬᠢᠨ are in it**, under "case-bound possession" —
  independently confirming the reader. ᠬᠢᠨ is the -ныхан of лууныхан.
- Also missing from our registry: ᠶᠤᠭᠠᠨ (the masculine mate of the ᠶᠦᠭᠡᠨ we
  do have), ᠲᠠᠶᠢᠭᠠᠨ/ᠲᠡᠶᠢᠭᠡᠨ, and the vocative ᠠ/ᠡ, which the code
  special-cases but the data never lists.
- **It contradicts us on ᠦᠭᠡᠢ**, listing it as NNBSP-connected — against the
  2026-07-25 ruling that it takes a space. It also hedges it under "negation
  (may or may not use NNBSP)", so our position survives, but the conflict is
  real and belongs in mongol-bichig's `sources.md`.
- **It lists ᠳᠠᠬᠢ/ᠳᠡᠬᠢ twice** as connector-joined, supporting `suffixes.md`
  over the reader's дахь ruling from the spot check.
- Our particle entries (ᠨᠢ, ᠮᠢᠨᠢ, ᠴᠢᠨᠢ, ᠳᠠ/ᠳᠡ, ᠬᠦ …) are absent from it, but
  its scope is case suffixes; its only "particles not using the NNBSP" are
  ᠤᠤ/ᠦᠦ.

Per sequence: **ᠰᠢᠭ** is corroborated — CeLCAR's grammar files it under
"postpositions of comparison: шиг, мэт". **ᠤᠷᠤᠭᠤ** is corroborated with a
hedge — Appendix IV marks the directive "may or may not use NNBSP", and
Wiktionary notes directive-case suffixes are written with a space because the
case developed recently. **ᠠᠠ/ᠡᠡ** is confirmed broken: the appendix's vocative
is a *single* ᠠ/ᠡ, exactly as the reader said, though it writes it with the
connector rather than a space. **ᠰᠠᠨ** looks mis-optioned — -сан is the verb
past-tense suffix written attached (bichig ᠭᠰᠠᠨ) and юмсан is one Cyrillic
word, so "belongs on the stem" fits the evidence better than "separate word".
**ᠯᠠ/ᠯᠡ is unresolved**: no source lists it either way, and the obvious
argument is a trap — Cyrillic writes нь, минь, чинь and даа as separate words
while bichig connects all four, and they are in our registry already. Cyrillic
spacing is not evidence about bichig spacing.

**Do not expect a standard to settle these.** MLREQ states the principle and
gives no inventory; UTN #57's particle dictionary governs *shaping*, not
connector-versus-space, and only reaches particles beginning with a/e/i/u/ü/d/y/n
— so ᠯᠠ, ᠰᠢᠭ, ᠰᠠᠨ and even ᠬᠢ could never appear in it whatever their status,
and their absence proves nothing. Richard Ishida's orthography notes put it
plainly: "there are no rules to determine when to apply it." Appendix IV plus a
reader is the best evidence available.

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
