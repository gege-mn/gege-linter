import { cp, isHudumLetter, uplus } from '../chars.js';
import type { Diagnostic, Rule } from '../types.js';

/**
 * Compatibility punctuation → the character that should have been encoded.
 *
 * Derived mechanically from each character's own compatibility decomposition
 * in the UCD, then overridden where Hudum has a native mark of its own
 * (comma, full stop, ellipsis) or where UTN #57 names a target. Every target
 * is a *visible* mark, so literals are safe here, but nothing in this table
 * was typed by hand — it was generated from the UCD and then machine-checked
 * code point by code point. Edit it the same way.
 */
const COMPAT_FIX: ReadonlyMap<number, string> = new Map([
  // Vertical Forms (U+FE10..U+FE1F) — GB 18030 round-trip
  [0xfe10, '᠂'], // comma → Mongolian comma
  [0xfe11, '᠂'], // ideographic comma → Mongolian comma
  [0xfe12, '᠃'], // ideographic full stop → Mongolian full stop
  [0xfe13, ':'], // colon
  [0xfe14, ';'], // semicolon
  [0xfe15, '!'], // exclamation mark → ASCII (owner's call; see docs/rules.md)
  [0xfe16, '？'], // question mark → fullwidth (UTN #57 Table 1)
  [0xfe17, '〖'], // left white lenticular bracket
  [0xfe18, '〗'], // right white lenticular brakcet [sic — known name defect]
  [0xfe19, '᠁'], // horizontal ellipsis → Mongolian ellipsis
  // CJK Compatibility Forms (U+FE30..U+FE4F) — CNS 11643
  [0xfe30, '‥'], // two dot leader
  [0xfe31, '—'], // em dash
  [0xfe32, '–'], // en dash
  [0xfe33, '_'], // low line
  [0xfe34, '_'], // wavy low line
  [0xfe35, '('], // left parenthesis
  [0xfe36, ')'], // right parenthesis
  [0xfe37, '{'], // left curly bracket
  [0xfe38, '}'], // right curly bracket
  [0xfe39, '〔'], // left tortoise shell bracket
  [0xfe3a, '〕'], // right tortoise shell bracket
  [0xfe3b, '【'], // left black lenticular bracket
  [0xfe3c, '】'], // right black lenticular bracket
  [0xfe3d, '《'], // left double angle bracket
  [0xfe3e, '》'], // right double angle bracket
  [0xfe3f, '〈'], // left angle bracket
  [0xfe40, '〉'], // right angle bracket
  [0xfe41, '「'], // left corner bracket
  [0xfe42, '」'], // right corner bracket
  [0xfe43, '『'], // left white corner bracket
  [0xfe44, '』'], // right white corner bracket
  [0xfe47, '['], // left square bracket
  [0xfe48, ']'], // right square bracket
  [0xfe49, '‾'], // dashed overline
  [0xfe4a, '‾'], // centreline overline
  [0xfe4b, '‾'], // wavy overline
  [0xfe4c, '‾'], // double wavy overline
  [0xfe4d, '_'], // dashed low line
  [0xfe4e, '_'], // centreline low line
  [0xfe4f, '_'], // wavy low line
  // Small Form Variants (U+FE50..U+FE6F) — CNS 11643
  [0xfe50, ','], // comma
  [0xfe51, '᠂'], // ideographic comma → Mongolian comma (not U+3001)
  [0xfe52, '.'], // full stop
  [0xfe54, ';'], // semicolon
  [0xfe55, ':'], // colon
  [0xfe56, '?'], // question mark
  [0xfe57, '!'], // exclamation mark
  [0xfe58, '—'], // em dash
  [0xfe59, '('], // left parenthesis
  [0xfe5a, ')'], // right parenthesis
  [0xfe5b, '{'], // left curly bracket
  [0xfe5c, '}'], // right curly bracket
  [0xfe5d, '〔'], // left tortoise shell bracket
  [0xfe5e, '〕'], // right tortoise shell bracket
  [0xfe5f, '#'], // number sign
  [0xfe60, '&'], // ampersand
  [0xfe61, '*'], // asterisk
  [0xfe62, '+'], // plus sign
  [0xfe63, '-'], // hyphen-minus
  [0xfe64, '<'], // less-than sign
  [0xfe65, '>'], // greater-than sign
  [0xfe66, '='], // equals sign
  [0xfe68, '\\'], // reverse solidus
  [0xfe69, '$'], // dollar sign
  [0xfe6a, '%'], // percent sign
  [0xfe6b, '@'], // commercial at
]);

/** Which legacy standard a compatibility code point was encoded to round-trip. */
const originOf = (c: number): string =>
  c <= 0xfe1f
    ? 'vertical presentation form (GB 18030 round-trip)'
    : c <= 0xfe4f
      ? 'CJK compatibility form (CNS 11643 round-trip)'
      : 'small form variant (CNS 11643 round-trip)';

/**
 * Chinese punctuation that core spec 13.5 assigns to Todo and Sibe, not to
 * Hudum — which has native marks for both. Guarded on the text actually
 * containing Hudum letters, because these are correct in Chinese.
 */
const BORROWED_FIX: ReadonlyMap<number, string> = new Map([
  [0x3001, '᠂'], // ideographic comma
  [0x3002, '᠃'], // ideographic full stop
  [0xff61, '᠃'], // halfwidth ideographic full stop
  [0xff64, '᠂'], // halfwidth ideographic comma
]);

/**
 * Punctuation encoded as a presentation form instead of as a character.
 *
 * Unicode 16.0 core spec §6.2.14: the Vertical Forms block "contains
 * compatibility characters needed for round-trip mapping to the Chinese
 * standard, GB 18030", and "the preferred Unicode approach to representation
 * of such text is to simply use the nominal characters that correspond to
 * these vertical variants. Then, at display time, the appropriate glyph is
 * selected according to the line orientation." §6.2.1 adds that for vertical
 * text "the regular punctuation characters are used instead, with alternate
 * glyphs for vertical layout supplied by the font".
 *
 * UTN #57 §2.3.1 says the same thing from the Mongolian side: vertical forms
 * of punctuation are a *shaping* phase (IB), "critical to the proper setting
 * of Mongolian text, but … not part of the complex shaping between letters
 * and format controls". The vertical glyph is the font's job; encoding it as
 * a code point takes that job away and breaks search, collation and
 * normalization — NFKC maps U+FE16 to bare `?`, not to U+FF1F.
 *
 * Two tiers, because the sources differ in strength:
 *
 * 1. `warning` — a compatibility code point from the Vertical Forms, CJK
 *    Compatibility Forms or Small Form Variants blocks. Both the core spec
 *    and UTN #57 agree these are wrong in interchange text. Always fixable.
 * 2. `info` — Chinese punctuation that is *valid Unicode* but off-model for
 *    Hudum: core spec 13.5 lists U+3001/U+3002 under what "Todo and Sibe may
 *    additionally use", while Hudum's own marks are U+1802 and U+1803.
 *
 * The fix targets are **deliberately not uniform**, and the asymmetry mirrors
 * the sources rather than contradicting them (owner's calls, 2026-08-02):
 * comma, full stop and ellipsis go to the native ᠂ ᠃ ᠁, which core spec 13.5
 * names as the traditional Mongolian marks; the question mark goes to
 * fullwidth ？, which UTN #57 Table 1 lists among the required characters;
 * the exclamation mark goes to plain ASCII `!`, because no source requires a
 * fullwidth one — 13.5 mentions exclamation marks only under the "Western
 * punctuation marks" that modern Mongolian "may use". Do not "fix" `!` to ！
 * for symmetry with ？; the two rest on different sources.
 *
 * Deliberately **not** flagged: ASCII `,` `.` `?` `!` in bichig text. Core
 * spec 13.5 states that in modern contexts Mongolian "may use a variety of
 * Western punctuation marks, such as parentheses, quotation marks, question
 * marks, and exclamation marks", so Western punctuation is sanctioned, not an
 * error. This rule only ever moves text off a presentation form.
 */
export const compatPunctuation: Rule = {
  name: 'compat-punctuation',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    const isHudumText = cps.some((ch) => isHudumLetter(cp(ch)));
    for (let i = 0; i < cps.length; i++) {
      const c = cp(cps[i]);
      const compat = COMPAT_FIX.get(c);
      if (compat !== undefined) {
        out.push({
          rule: 'compat-punctuation',
          severity: 'warning',
          message: `${originOf(c)} ${uplus(c)} — a compatibility character, not for interchange; write ${uplus(compat)} and let the font supply the vertical glyph`,
          start: i,
          end: i + 1,
          fix: compat,
        });
        continue;
      }
      const borrowed = isHudumText ? BORROWED_FIX.get(c) : undefined;
      if (borrowed !== undefined) {
        out.push({
          rule: 'compat-punctuation',
          severity: 'info',
          message: `${uplus(c)} is Chinese-borrowed punctuation — core spec 13.5 gives it to Todo and Sibe; Hudum writes ${uplus(borrowed)}`,
          start: i,
          end: i + 1,
          fix: borrowed,
        });
      }
    }
    return out;
  },
};
