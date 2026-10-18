# Changelog

## 0.8.0 — 2026-10-19

Findings now come in four languages, and each has a code that reads the same
in all of them. Every message's English is what it was in 0.7.0.

### Added

- **Messages in four languages: English, Mongolian, Simplified Chinese and
  French.** Every diagnostic now carries a `messageId` (e.g.
  `nnbsp-legacy/connector`) and the `data` filled into it; `message` stays
  English and unchanged. `localize(diagnostic, 'mn')` gives it in another
  locale (`locales`: `en`, `mn`, `zh-Hans`, `fr`; `isLocale` narrows a
  string to one), and `messages` exports the catalogs themselves. A locale or
  id the catalogs do not have gets the English `message` back. A diagnostic from a rule outside the package has no
  `messageId` and keeps its own message.
- **CLI `--lang <lang>`** (also `--lang=…`; default `en`) for the findings,
  in the human output and in `--json`. The rest of the CLI's output stays
  English.
- **Codes.** Every diagnostic carries a `code`: `GL`, two digits for the
  rule, two for the variant — `GL0101` NNBSP as a suffix connector, `GL0102`
  NNBSP before a particle, through `GL1202`. Published codes are never
  renumbered or reused. `codes` maps each `messageId` to its code, and the
  CLI prints it before the rule name.

## 0.7.0 — 2026-10-11

Menksoft's glyph encoding can now be read, not only reported.

### Added

- **`menksoftToUnicode(text)`** — rewrites text in the Menksoft Private Use
  Area encoding (U+E234–E34F, Hudum) as standard Unicode. The glyph reading
  is a TypeScript port of suragch's [`mongol_code`](https://github.com/suragch/mongol_code)
  (CC0), Menksoft → Unicode direction only, held to its 468 upstream test
  cases. On top of it the existing fixes run: a particle after the suffix
  space gets a plain space where the port says MVS, and so does any run the
  suffix dictionary does not know; `compat-punctuation` replaces the vertical
  presentation forms; `non-initial-o` writes the two spellings it has settled.
- **`isMenksoft(text)`** — the guard for it: a Menksoft letter present and no
  Private Use Area code point outside the band, which keeps other glyph
  encodings and icon fonts out.
- **`detached-suffix`** — an ending that belongs on the stem, written after a
  suffix connector (MVS or legacy NNBSP). The habitual ᠳᠠᠭ/ᠳᠡᠭ (-даг/-дэг)
  has no detached form: **error**, in the default set. The fix attaches it by
  deleting the connector, and where the stem ends in a separated final a/e
  it deletes that vowel's MVS too, since the vowel becomes medial. The
  sequences are held in the rule, not read from the suffix dictionary.
- **Formal mode.** In legal and other formal documents the comitative
  ᠲᠠᠢ/ᠲᠡᠢ and the ordinals ᠳᠤᠭᠠᠷ/ᠳᠦᠭᠡᠷ, ᠳᠠᠬᠢ/ᠳᠡᠬᠢ are attached as
  well. `formalRules` (also `rulesFor('formal')`, type `Mode`) is `rules` with
  those six reported as **warnings**, each with the same fix:
  `lint(text, formalRules)`. After a digit nothing is reported in either mode.
  Exported with it: `detachedSuffix`, `detachedSuffixFormal`,
  `nnbspLegacyFormal`.
- **CLI `--mode formal`** (also `--mode=formal`; default `default`). It
  applies to `--fix` and `--list-rules` too.

### Changed

- **`no-pua` offers a fix** for a run that lies wholly inside the Menksoft
  band and holds a letter: its Unicode reading. Runs outside the band are
  reported as before, with no fix. The message and severity are unchanged.
- **`non-initial-o` offers a fix for two words**, ᠮᠣᠩᠭᠣᠯ → ᠮᠣᠩᠭᠤᠯ and
  ᠰᠣᠳᠣᠪᠢᠯᠢᠭ → ᠰᠣᠳᠤᠪᠢᠯᠢᠭ, which a reader has ruled on. Every other hit is still
  a hint with no fix: a loanword, a proper noun and a slip look alike.
  `applyFixes(text, lint(text))` therefore now rewrites those two words.
- **`lint(text)` reports connector-joined ᠳᠠᠭ/ᠳᠡᠭ as an error**, from the
  new `detached-suffix` rule, and `applyFixes` attaches it. It was silent
  before, because the suffix dictionary lists the pair.
- **`nnbsp-legacy` and `unknown-suffix` are silent on a connector that
  `detached-suffix` reports**, so each connector has one diagnostic and one
  fix. `unknown-suffix` skips ᠳᠠᠭ/ᠳᠡᠭ whether or not the dictionary lists
  them, which keeps it from reporting "unknown suffix" there once they are
  removed from `@gege-mn/mongol-bichig`. Run on its own, `nnbspLegacy` no
  longer rewrites NNBSP before ᠳᠠᠭ/ᠳᠡᠭ; pair it with `detachedSuffix`.
- **`tungaamalToUnicode` attaches ᠳᠠᠭ/ᠳᠡᠭ** rather than joining it with
  MVS: `detachedSuffix` runs in its second pass.

## 0.6.0 — 2026-10-10

Two functions added, no rule changed: every diagnostic is what it was in 0.5.0.

### Changed

- **`applyFixes` is linear.** It spliced each fix into the array, which is
  quadratic once fixes change the length: 1 MB of text dense with stray-FVS
  suffixes took 5.6 s to fix against 0.19 s to lint. Output is unchanged for
  fixes that do not overlap, which is every set `lint` returns.

### Added

- **`tungaamalToUnicode(text)`** — rewrites text typed with the Tungaamal
  keyboard as standard Unicode Hudum. No new rule and no new mapping: it is
  the existing fixes in the one safe order, `wrong-block`'s U+1888 → ᠬ and
  U+1889 → ᠭ first, then `nnbsp-legacy` and `unknown-suffix` judged on the
  corrected letters. A single `applyFixes(text, lint(text))` gets a particle spelled
  with the look-alike wrong — ᠦ\u1889ᠡᠢ after NNBSP is joined with MVS where
  ᠦᠭᠡᠢ takes a plain space. Encoding only; Tungaamal's spellings are left as
  written.
- **`isTungaamal(text)`** — the guard for it: either look-alike present and no
  other Ali Gali letter (U+1880–18AA) in the text, so a real Ali Gali passage
  is not taken for Tungaamal's and rewritten.

## 0.5.0 — 2026-08-02

One rule added. **No `@gege-mn/mongol-bichig` version gate this time** — unlike
0.4.0, nothing here reads the suffix registry, so the existing `^0.2.0` range
is sufficient and a lockfile pinned at 0.2.0 loses nothing.

### Added

- **`compat-punctuation`** (in the default rule set) — punctuation encoded as
  a *presentation form* rather than as a character. Two tiers:

  - **warning, always fixable** — any of the 69 mapped code points in Vertical
    Forms (U+FE10–FE1F), CJK Compatibility Forms (U+FE30–FE4F) or Small Form
    Variants (U+FE50–FE6F).
  - **info, fixable** — U+3001/U+3002 and halfwidth U+FF61/U+FF64 inside Hudum
    text, which core spec 13.5 assigns to Todo and Sibe rather than Hudum. This
    tier is silent unless the text really contains Hudum letters, since those
    marks are correct in Chinese.

  Two sources converge from opposite directions. Unicode 16.0 core spec
  §6.2.14: the Vertical Forms block holds "compatibility characters needed for
  round-trip mapping to the Chinese standard, GB 18030", and "the preferred
  Unicode approach … is to simply use the nominal characters that correspond to
  these vertical variants. Then, at display time, the appropriate glyph is
  selected according to the line orientation." UTN #57 §2.3.1 makes it a
  *shaping* claim: vertical forms of punctuation are phase IB, "critical to the
  proper setting of Mongolian text, but … not part of the complex shaping
  between letters and format controls" — the vertical glyph is the font's job,
  and encoding it as a code point takes that job away.

  The lookup table is generated from each character's own UCD compatibility
  decomposition and machine-checked code point by code point, then overridden
  where Mongolian has a mark of its own or a source names a target:

  | Mark | Target | Why |
  |---|---|---|
  | comma, full stop, ellipsis | ᠂ ᠃ ᠁ (U+1802/1803/1801) | core spec 13.5 names these as the traditional Mongolian marks |
  | question mark | ？ (U+FF1F) | UTN #57 Table 1 lists the CJK question mark among required characters |
  | exclamation mark | `!` (U+0021) | no source requires a fullwidth one |
  | everything else | nominal character | the UCD decomposition |

  **The sentence-final pair is deliberately asymmetric — ？ but `!`.** Only the
  question mark has a source requiring a CJK form; core spec 13.5 mentions
  exclamation marks only among the "Western punctuation marks" that modern
  Mongolian "may use". A test pins both targets so the asymmetry is not tidied
  away later. U+FE51 is routed to ᠂ rather than to its nominal U+3001 so one
  `--fix` pass cannot leave text the info tier immediately re-flags.

  **Deliberately not flagged: ASCII `,` `.` `?` `!` in bichig text** — 13.5
  sanctions Western punctuation outright. The rule only ever moves text *off* a
  presentation form. Also out of scope: U+1807/1808/1809, the Sibe/Manchu
  marks, which belong with `wrong-block`.

  Worth knowing before relying on the ？ target: it is formally just the wide
  variant of ASCII (`<wide> 003F`), and **NFKC maps ？ to `?` exactly as it maps
  ︖ to `?`**. It is the only target in the table a normalizing step can undo;
  ᠂ ᠃ ᠁ and `!` are all NFKC-stable.

  **Fires on 0 of the 35,320 harvest rows.** That is a clean false-positive
  result, not evidence of value — the corpus is punctuation-poor (its only
  marks are U+202F, ZWJ, ᠂ and nirugu, with no full stop or question mark
  anywhere), so it can neither confirm nor refute real-world incidence. The
  rule targets text pasted out of legacy Chinese and Inner Mongolian systems,
  which that corpus is not.

## 0.4.0 — 2026-07-27

Two rules added, one narrowed, one deliberately kept out of the default set,
and a data-loss bug fixed in `--fix`.

**Publish `@gege-mn/mongol-bichig` 0.2.1 first.** Part of what is documented
here is suffix coverage that lives only in that version's registry, and it is
released as a *patch* precisely so this package's existing `^0.2.0` range picks
it up: a fresh install of gege-linter 0.4.0 resolves to the newest 0.2.x.
Anyone carrying a lockfile pinned at 0.2.0 keeps the old coverage until they
update it — the range is deliberately not raised to `^0.2.1`, because a floor
above the newest published version makes this repo un-installable.

To be precise about what is gated: `unknown-suffix`'s separate-word message
already works against 0.2.0 for the four words that version registers (ᠤᠤ, ᠦᠦ,
ᠪᠦᠦ, ᠦᠭᠡᠢ). What needs 0.2.1 is the *added* coverage — ᠰᠢᠭ, ᠤᠷᠤᠭᠤ, ᠰᠠᠨ/ᠰᠡᠨ as
space-joined words, and ᠬᠢ, ᠬᠢᠨ, ᠶᠤᠭᠠᠨ, ᠯᠠ/ᠯᠡ as connector suffixes. Nothing in
this release breaks against 0.2.0; it just reports less.

### Added

- **`doubled-ae`** (warning, **no fix**) — adjacent ᠠᠠ or ᠡᠡ. Long a/e take
  the γ/g hiatus and are never doubled, so a pair is Cyrillic аа/ээ copied
  letter for letter. No mechanical fix because the two populations behind it
  want different repairs: a reflexive that should be ᠢᠶᠠᠨ/ᠢᠶᠡᠨ, and the
  vocative, which is a single ᠠ/ᠡ written as its own word. ᠣᠣ (short o) and
  ᠤᠤ/ᠦᠦ (question particles) are untouched. Fires on 88 of 35,320 harvest rows.
- **`fusableStack`** (info, **no fix**, **not in the default rule set**) — an analytic (задлаг) case +
  reflexive stack that has a registered fused (нийлэг) equivalent: ᠳᠤ + ᠪᠠᠨ
  may also be written ᠳᠠᠭᠠᠨ, ᠳᠦ + ᠪᠡᠨ as ᠳᠡᠭᠡᠨ, and likewise for ᠲᠤ/ᠲᠦ and
  ᠠᠴᠠ/ᠡᠴᠡ. Both spellings are correct, which is why it carries no mechanical
  fix — `--fix` must never rewrite one valid style into another. The fused
  sequence is named in the message and the reported span covers the whole
  stack including its leading connector, so a consumer that wants one-click
  apply builds connector + sequence over that span. Requested by a bichig
  reader; 538 analytic stacks in 4,000 sentences of real bichig and **zero**
  fused forms anywhere in that corpus. It is exported but left out of `rules`,
  because it is the only rule that reports text which is *right*, and 538 hits
  per 4,000 correct sentences is how a tool teaches people to ignore it. Opt in
  with `lint(text, [...rules, fusableStack])`; the CLI and CI never see it.
- `test/rulings.test.ts` — the verdicts a bichig reader returned on a
  28-item random spot check (seed 161294890). Confirmed 4 of 4 on
  `nnbsp-legacy`'s NNBSP→MVS swap, on `wrong-block`'s U+1888→ᠬ / U+1889→ᠭ, and
  on `unknown-suffix`'s stray-FVS drop — that last one **reversing an earlier
  contradiction** from the same reader, re-checked against current Noto. Four
  clean words drew no false positives. Open questions are `it.todo` with the
  correct answer written down; do not re-litigate them.
- `scripts/build-spotcheck.mjs` — dev-only generator for that review page.
  Draws a random, rule-balanced sample of real third-party bichig, runs `lint`
  over it, and renders a vertical-script page whose selections collect into one
  copy-pasteable answer block. Reproducible by seed. Not shipped: `files` is
  still `dist` only.

### Fixed

- **`--fix` no longer destroys bytes in a file that is not valid UTF-8.**
  Reading with `readFileSync(path, 'utf8')` maps every invalid byte to U+FFFD
  without complaint, and `--fix` then wrote those replacements back over the
  original — silent, irreversible loss of bytes no rule had diagnosed, reported
  as `✔ fixed 1` with exit 0. Verified: a file ending `c3 28 ff fe 80` came back
  with four U+FFFD in their place. A file that does not round-trip through UTF-8
  is now refused (`cannot read …: not valid UTF-8`, exit 2) and left untouched,
  rather than linted as mojibake. Present since `--fix` shipped in 0.3.0; the
  audience for a *legacy* Mongolian linter is exactly the people holding files
  in some other encoding.

### Changed

- **`--list-rules` mentions the opt-in rule, on stderr.** stdout is unchanged —
  one bare rule name per line, only the rules the CLI actually runs, so a script
  parsing it keeps working. The note that `fusable-stack` exists and is library-
  only goes to stderr, where a human still sees it in a terminal.
- **`unknown-suffix` recognises a connector in front of a whole word.** When
  the run after the connector is one of `spaceParticles`, the message now says
  so — "‘ᠦᠭᠡᠢ’ (үгүй) is a separate word, not a suffix — it takes a plain
  space, never a connector" — instead of reporting an unknown suffix, and
  carries a fix swapping the connector for a space. Offered **only after MVS**:
  after NNBSP, `nnbsp-legacy` already corrects the connector over a span inside
  this one, and two fixes overlapping the same code points would corrupt
  `applyFixes`. Once mongol-bichig ships the four space-joined words a reader
  ruled on 2026-07-27 (ᠰᠢᠭ, ᠤᠷᠤᠭᠤ, ᠰᠠᠨ/ᠰᠡᠨ), this covers 202 more corpus hits
  with no further change here.
- **`zwj-zwnj` now flags a ZWJ only *between* two Mongolian letters.** It
  previously flagged any joiner adjacent to one, on the premise that running
  text never needs them. The core spec says otherwise: 16.0 §13.5 sanctions
  ZWJ/ZWNJ for "select[ing] a particular positional form of a letter in
  isolation" and tabulates the sequences — `<1820 200D>` initial, `<200D 1820>`
  final, `<200D 1820 200D>` medial. That is how bichig writes **abbreviations**:
  ЗХУ is each letter followed by ZWJ and U+1802, the joiner holding an initial
  form that would otherwise go final before the punctuation. A bichig reader
  confirmed most sources write them that way. **All 85 joiners in 35,320
  harvested words and 4,000 sentences are that pattern** — the rule was 100%
  false positives and now reports none of them. A ZWJ between two letters is
  still flagged (FVS1–4 is the registered mechanism for a form override, and the
  spec warns that older documentation ordered ZWJ and FVS the other way round);
  the corpus contains no instance of that. Emoji sequences were never affected.

  **The boundary exemption is ZWJ-only.** The spec sentence names both
  characters, but every piece of supporting evidence is ZWJ's — the tabulated
  sequences, the abbreviation pattern, all 85 corpus hits. A ZWNJ at a word edge
  selects nothing, because the letter is already non-joining on that side, so it
  is the redundant debris this rule exists to find and stays reported wherever
  it touches a Mongolian letter.
- **`fvs-placement` messages now name what the selector landed on** — e.g.
  "FVS1 (U+180B) follows FVS1 (U+180B)". A doubled selector previously read as
  a complaint about the visible letter before it, and a reader ruled the one
  real error in a 31,320-word corpus a false alarm for a claim the rule was
  never making. The diagnostic's rule, severity and span are unchanged (it has
  never carried a fix); only the message text differs.

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
