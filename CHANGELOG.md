# Changelog

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
