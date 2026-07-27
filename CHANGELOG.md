# Changelog

## Unreleased

Not released: the new rule fires on text that is already correct, so whether
that ships by default is the owner's call. A 0.4.0 minor is the right shape if
it does.

### Added

- **`doubled-ae`** (warning, **no fix**) — adjacent ᠠᠠ or ᠡᠡ. Long a/e take
  the γ/g hiatus and are never doubled, so a pair is Cyrillic аа/ээ copied
  letter for letter. No mechanical fix because the two populations behind it
  want different repairs: a reflexive that should be ᠢᠶᠠᠨ/ᠢᠶᠡᠨ, and the
  vocative, which is a single ᠠ/ᠡ written as its own word. ᠣᠣ (short o) and
  ᠤᠤ/ᠦᠦ (question particles) are untouched. Fires on 88 of 35,320 harvest rows.
- **`fusable-stack`** (info, **no fix**) — an analytic (задлаг) case +
  reflexive stack that has a registered fused (нийлэг) equivalent: ᠳᠤ + ᠪᠠᠨ
  may also be written ᠳᠠᠭᠠᠨ, ᠳᠦ + ᠪᠡᠨ as ᠳᠡᠭᠡᠨ, and likewise for ᠲᠤ/ᠲᠦ and
  ᠠᠴᠠ/ᠡᠴᠡ. Both spellings are correct, which is why it carries no mechanical
  fix — `--fix` must never rewrite one valid style into another. The fused
  sequence is named in the message and the reported span covers the whole
  stack including its leading connector, so a consumer that wants one-click
  apply builds connector + sequence over that span. Requested by a bichig
  reader; 538 analytic stacks in 4,000 sentences of real bichig and **zero**
  fused forms anywhere in that corpus.
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

### Changed

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
- **`fvs-placement` messages now name what the selector landed on** — e.g.
  "FVS1 (U+180B) follows FVS1 (U+180B)". A doubled selector previously read as
  a complaint about the visible letter before it, and a reader ruled the one
  real error in a 31,320-word corpus a false alarm for a claim the rule was
  never making. Diagnostic rule, severity, span and fix are unchanged; only the
  message text differs.

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
