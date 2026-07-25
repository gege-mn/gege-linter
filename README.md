# gege-linter

**The errors you cannot see.** A linter for traditional Mongolian script
(Mongol bichig) — the first of its kind.

Mongol bichig text can look perfect and still be encoded wrong. The script's
grammar lives partly in invisible characters — connectors and variation
selectors with no shape of their own. When one is wrong, nothing looks broken
today; the text quietly fails tomorrow — in another font, another OS, a
search index, or a copy-paste.

## Three invisible failures

<!--
  A screenshot, on purpose: README viewers render bichig with whatever font
  the READER has — usually Mongolian Baiti (1996) or tofu, never the current
  shaping model. This image is rendered with Noto Sans Mongolian v3.002
  (Unicode 16 / UTN #57 model). If this repo gets a GitHub remote, switch the
  relative path to an absolute raw.githubusercontent.com URL so it also shows
  on npmjs.com.
-->

![Three failure modes, each shown wrong-vs-correct with code points: NNBSP vs
MVS render pixel-identically; a plain space demotes the genitive suffix to a
standalone vowel; Ali Gali U+1888 passes for Hudum U+182C at a
glance.](assets/invisible-failures.png)

1. **The legacy connector** — `nnbsp-legacy`, *shipped.* NNBSP (U+202F) and
   MVS (U+180E) joined suffixes render **pixel-identically**, but the left
   was made legacy by Unicode 16.0 (2024). No eye and no font can tell;
   only the bytes differ.
2. **The plain space** — `space-before-suffix`, *planned.* An ordinary space
   quietly demotes the suffix to a standalone vowel — grammatically visible,
   yet nothing complains. This exact bug once shipped on
   [gege.mn](https://gege.mn)'s footer.
3. **The look-alike letter** — `wrong-block`, *shipped.* A letter from the
   Ali Gali block (Sanskrit–Tibetan transcription) passing for Hudum ᠬ at a
   glance. Real keyboards actually emit it — and search, sorting, and screen
   readers all silently break.

## The ground kept moving

The "correct" way to write a Mongolian suffix has changed under everyone's
feet:

- **1999** — Unicode 3.0 prescribes **NNBSP (U+202F)** as the suffix
  connector.
- **2017** — A dedicated suffix-connector character is proposed — and
  rejected.
- **2023** — Noto Sans Mongolian is re-engineered onto the new shaping model.
- **2024** — **Unicode 16.0 moves the connector role to MVS (U+180E).**
  NNBSP becomes legacy — mentioned only in the rewritten spec chapter, not
  the release notes.
- **2025** — W3C's Mongolian layout requirements still document the old
  model.

So text that was correct when written is legacy today, guidance online
contradicts itself, and no tool existed to check any of it — for a script
used by millions. gege-linter encodes the current model (Unicode 16+,
[UTN #57]) as mechanical rules.

## Usage

```ts
import { applyFixes, lint } from 'gege-linter';

const diagnostics = lint(text);
// [{ rule: 'nnbsp-legacy', severity: 'warning', start: 5, end: 6, fix: '\u180E', … }]

const fixed = applyFixes(text, diagnostics); // code-point-safe — never String.slice
```

Every diagnostic carries **code-point offsets** and, when the correction is
mechanical, a `fix` replacement string.

## Rules

| Rule | Severity | What it flags |
| --- | --- | --- |
| `mvs-context` | error | MVS not sitting between two Mongolian letters — structurally broken; fonts render a visible nominal glyph |
| `fvs-placement` | error | FVS1–4 not immediately after the Mongolian letter it modifies (a doubled FVS fails the same test) |
| `no-pua` | error | Private Use Area code points — Menksoft-era glyph encoding, tofu everywhere else; contiguous runs report once |
| `wrong-block` | warning | Todo / Sibe / Manchu / Ali Gali letters in Hudum text; known look-alikes (U+1888/U+1889) get a mechanical fix |
| `zwj-zwnj` | warning | ZWJ/ZWNJ beside a Mongolian letter — running text never needs them (emoji sequences are left alone) |
| `nnbsp-legacy` | warning | NNBSP joining two Mongolian letters — the pre-16.0 suffix connector; fix: MVS |
| `unknown-suffix` | warning | MVS- (or legacy NNBSP-) joined letter run not in the curated 63-entry Hudum suffix dictionary (`docs/suffixes.md`); the separated final a/e (ᠬᠠᠷ‑ᠠ) is exempt |
| `non-initial-o` | info | O/Ö (U+1823/U+1825) past the first syllable — dumb vowel-position heuristic; native exceptions (ᠮᠣᠩᠭᠣᠯ) and loanwords are legitimate |

The suffix dictionary itself ships as part of the public API (`suffixes`),
sourced from school grammar, UTN #57, and the mongfontbuilder registry.

Roadmap (see `CLAUDE.md`): `space-before-suffix` · FVS registration against
the standardized-variant tables · full stem–suffix vowel-harmony agreement.

## Why it matters

- **First of its kind.** No Mongolian encoding linter existed before this
  (surveyed 2026-07).
- **Mechanical, not opinionated.** Rules encode Unicode 16 + UTN #57 — the
  published standard, not taste.
- **Fixes, not just flags.** Every legacy connector comes with a
  one-code-point replacement.
- **Zero dependencies.** Pure TypeScript, code-point offsets, runs anywhere —
  editor, CI, browser.

## Development

```sh
pnpm install
pnpm test
pnpm build
pnpm lint
```

[UTN #57]: https://www.unicode.org/notes/tn57/

## License

MIT. Example images rendered with Noto Sans Mongolian (OFL).
