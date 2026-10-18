import { MVS } from './chars.js';
import { convertMenksoftToUnicode } from './menksoft/convert.js';
import * as Menksoft from './menksoft/menksoft.js';
import { compatPunctuation } from './rules/compat-punctuation.js';
import { detachedSuffix, detachedSuffixFormal } from './rules/detached-suffix.js';
import { doubledAe } from './rules/doubled-ae.js';
import { fusableStack } from './rules/fusable-stack.js';
import { fvsPlacement } from './rules/fvs-placement.js';
import { mvsContext } from './rules/mvs-context.js';
import { nnbspLegacy, nnbspLegacyFormal } from './rules/nnbsp-legacy.js';
import { noPua } from './rules/no-pua.js';
import { nonInitialO } from './rules/non-initial-o.js';
import { unknownSuffix } from './rules/unknown-suffix.js';
import { wrongBlock } from './rules/wrong-block.js';
import { zwjZwnj } from './rules/zwj-zwnj.js';
import type { Diagnostic, Rule } from './types.js';

export type { SuffixCategory, SuffixEntry } from './data/suffixes.js';
export { suffixes } from './data/suffixes.js';
export type { Catalog, Locale, MessageData, MessageId } from './messages/index.js';
export { codes, isLocale, locales, localize, messages } from './messages/index.js';
export type { Diagnostic, Rule, Severity } from './types.js';
export {
  compatPunctuation,
  detachedSuffix,
  detachedSuffixFormal,
  doubledAe,
  fusableStack,
  fvsPlacement,
  mvsContext,
  nnbspLegacy,
  nnbspLegacyFormal,
  nonInitialO,
  noPua,
  unknownSuffix,
  wrongBlock,
  zwjZwnj,
};

/**
 * The default rule set: structural errors, then legacy/compat warnings, then
 * hints. Every rule here reports text that is *wrong*.
 *
 * `fusableStack` is deliberately absent. It reports correct text — an analytic
 * suffix stack that has an equally correct fused spelling — so it is opt-in:
 * `lint(text, [...rules, fusableStack])`, or on its own for an editor that
 * wants the hint. In a CLI or CI run it would be 538 lines of noise per 4,000
 * sentences about nothing being wrong.
 */
export const rules: readonly Rule[] = [
  mvsContext,
  fvsPlacement,
  noPua,
  detachedSuffix,
  wrongBlock,
  zwjZwnj,
  nnbspLegacy,
  compatPunctuation,
  unknownSuffix,
  doubledAe,
  nonInitialO,
];

/**
 * `rules` for legal and other formal documents: `detachedSuffix` also reports
 * the endings that are attached there (-тай, -дугаар, -дахь and their
 * feminine forms), and `nnbspLegacy` leaves those connectors to it.
 */
export const formalRules: readonly Rule[] = rules.map((r) =>
  r === detachedSuffix ? detachedSuffixFormal : r === nnbspLegacy ? nnbspLegacyFormal : r,
);

export type Mode = 'default' | 'formal';

/** The rule set for a mode: `lint(text, rulesFor('formal'))`. */
export const rulesFor = (mode: Mode): readonly Rule[] => (mode === 'formal' ? formalRules : rules);

/** Lint Mongolian-script text; diagnostics come back sorted by position. */
export function lint(text: string, active: readonly Rule[] = rules): Diagnostic[] {
  return active.flatMap((r) => r.check(text)).sort((a, b) => a.start - b.start || a.end - b.end);
}

/**
 * Apply the mechanical `fix` replacements to `text`, working in code-point
 * space — diagnostic offsets are code points, so `String.slice` (UTF-16)
 * would corrupt text containing astral characters. The result is built in one
 * forward pass, so a long text with many fixes stays linear.
 */
export function applyFixes(text: string, diagnostics: readonly Diagnostic[]): string {
  const cps = [...text];
  const fixable = diagnostics.filter((d): d is Diagnostic & { fix: string } => d.fix !== undefined);
  const out: string[] = [];
  let at = 0;
  for (const d of [...fixable].sort((a, b) => a.start - b.start)) {
    out.push(cps.slice(at, d.start).join(''), d.fix);
    at = Math.max(at, d.end);
  }
  out.push(cps.slice(at).join(''));
  return out.join('');
}

const TUNGAAMAL_K = 0x1888;
const TUNGAAMAL_G = 0x1889;

/**
 * Whether `text` carries Tungaamal's signature: the Ali Gali look-alikes
 * U+1888/U+1889 standing in for feminine k and g, and no other Ali Gali
 * letter anywhere.
 *
 * The second half is what keeps real Ali Gali out. There U+1888 is the vowel
 * I and U+1889 the consonant KA, two characters of a 43-character set, and a passage
 * that uses them reaches for the rest of the set too; Tungaamal never emits
 * any of the others.
 *
 * It answers only for text that has a feminine k or g in it. Tungaamal text
 * without one is indistinguishable from any other pre-Unicode-16 text, and is
 * `false` here.
 */
export function isTungaamal(text: string): boolean {
  let found = false;
  for (const ch of text) {
    const c = ch.codePointAt(0) ?? 0;
    if (c === TUNGAAMAL_K || c === TUNGAAMAL_G) found = true;
    else if (c >= 0x1880 && c <= 0x18aa) return false;
  }
  return found;
}

/**
 * Rewrite text typed with the Tungaamal keyboard as standard Unicode Hudum.
 *
 * Tungaamal's output is not a private encoding: it is the Mongolian block plus
 * two substitutions and the pre-Unicode-16 connector model, and each of those
 * already has a mechanical fix in a rule. This is those fixes in the one order
 * that is safe for them:
 *
 * 1. **The letters.** Feminine k and g come out as the Ali Gali look-alikes
 *    U+1888/U+1889 (masculine uses the standard QA/GA), and `wrong-block`
 *    maps them to U+182C/U+182D.
 * 2. **The connectors**, judged on the corrected letters — NNBSP to MVS, or to
 *    a plain space before a particle, and stray FVS off suffix heads.
 *
 * One pass is not enough, which is why this is a function and not a recipe.
 * Both suffix rules compare against a dictionary spelled with the standard
 * letters, so a suffix or particle still carrying U+1889 is not recognised:
 * ᠦᢉᠡᠢ after NNBSP gets MVS where the particle ᠦᠭᠡᠢ takes a plain space.
 *
 * **Only for text known to be Tungaamal's** — `isTungaamal` is the test. Real
 * Ali Gali uses U+1888 and U+1889 as letters in their own right and would be
 * rewritten for good.
 *
 * Encoding only. Tungaamal also *spells* some words differently (`sayin` for
 * сайн, detached case particles); that is orthography, not Unicode, and is
 * left exactly as written. So is everything the other rules report —
 * punctuation above all, which is not Tungaamal's to answer for.
 */
export function tungaamalToUnicode(text: string): string {
  const letters = applyFixes(text, lint(text, [wrongBlock]));
  return applyFixes(letters, lint(letters, [nnbspLegacy, unknownSuffix, detachedSuffix]));
}

const isPua = (c: number): boolean => c >= 0xe000 && c <= 0xf8ff;

/**
 * Whether `text` is in the Menksoft glyph encoding: at least one Private Use
 * Area code point from Menksoft's Hudum letter band, and none from outside
 * U+E234–E34F.
 *
 * The second half is the guard. The same Private Use Area is where Saiyin and
 * the other glyph fonts put *their* shapes, on different code points, and
 * where icon fonts live; text with a PUA code point outside the band is not
 * something `menksoftToUnicode` can read, and is `false` here. Saiyin text
 * that happens to stay inside the band is indistinguishable, and is `true`.
 */
export function isMenksoft(text: string): boolean {
  let found = false;
  for (const ch of text) {
    const c = ch.codePointAt(0) ?? 0;
    if (!isPua(c)) continue;
    if (!Menksoft.isMenksoft(c)) return false;
    if (Menksoft.isLetter(c)) found = true;
  }
  return found;
}

/**
 * Rewrite text in the Menksoft glyph encoding (Private Use Area,
 * U+E234–E34F) as standard Unicode Hudum.
 *
 * Menksoft text stores the *shape* of every letter — one code point per
 * positional form — so reading it back is a judgement per glyph on position,
 * gender and neighbours. That part is a port of suragch's `mongol_code`
 * (CC0), Menksoft → Unicode direction only, kept faithful to the original.
 *
 * Its output is then held to this package's model, because the two differ in
 * two mechanical places:
 *
 * 1. **Particles.** Menksoft's suffix space becomes MVS before any letter.
 *    `unknown-suffix` knows which of those runs are whole words, and gives
 *    them the plain space they take.
 *    A run the suffix dictionary does not know gets the space as well: a
 *    connector is written only for a suffix that is known to be one.
 * 2. **Punctuation.** The vertical glyphs map to compatibility presentation
 *    forms, and `compat-punctuation` writes the ordinary character.
 * 3. **Spelling**, for the few words `non-initial-o` has a settled answer
 *    for. Every other later-syllable O is the source's, and is kept.
 *
 * Hudum only: Todo, Sibe and Manchu glyphs lie outside the band and are left
 * as they are, where `no-pua` reports them. **Only for text known to be
 * Menksoft's** — `isMenksoft` is the test.
 */
export function menksoftToUnicode(text: string): string {
  const unicode = convertMenksoftToUnicode(text);
  const cps = [
    ...applyFixes(
      unicode,
      lint(unicode, [compatPunctuation, detachedSuffix, unknownSuffix, nonInitialO]),
    ),
  ];
  for (const d of lint(cps.join(''), [unknownSuffix])) {
    if (d.fix === undefined && cps[d.start - 1] === MVS) cps[d.start - 1] = ' ';
  }
  return cps.join('');
}
