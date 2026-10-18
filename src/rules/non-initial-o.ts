import { cp, FVS, isMongolLetter, isVowel, MVS, NIRUGU, NNBSP } from '../chars.js';
import { msg } from '../messages/index.js';
import type { Diagnostic, Rule } from '../types.js';

const O = 'ᠣ';
const OE = 'ᠥ';

/**
 * Words a bichig reader has ruled on: the later O is a misspelling, never a
 * loan or a name, so the U is safe to write for them. Spelled without FVS.
 * Everything else stays a hint — a loanword, a proper noun and a slip look
 * the same from here.
 */
const SETTLED: ReadonlySet<string> = new Set(['ᠮᠣᠩᠭᠣᠯ', 'ᠰᠣᠳᠣᠪᠢᠯᠢᠭ']);

/**
 * Dumb static vowel-position check: in native Hudum orthography O/Ö appear
 * only in a word's first syllable — later round vowels are written U/Ü.
 *
 * The rule is categorical, so ᠮᠣᠩᠭᠣᠯ is a real hit and not an exception:
 * the correct spelling is ᠮᠣᠩᠭᠤᠯ. This reverses what the rule's own notes
 * claimed until 2026-07-26 — a bichig reader ruled on it, and Tungaamal
 * applies the rule everywhere else in its own output (ᠪᠣᠭᠤᠨᠢ, ᠣᠷᠤᠢ,
 * ᠲᠣᠭᠤᠭ\u180Eᠠ) while exempting only this one word.
 *
 * Info severity on purpose all the same: loanwords keep their o (ᠹᠣᠲᠣ,
 * ᠻᠢᠨᠣ) and a few native words are genuine lexical exceptions — ᠭᠣᠣᠯ has a
 * doubled short o. So this stays a "look here" hint, never an error.
 *
 * The fix is offered only inside a `SETTLED` word.
 */
/** The letters of the stem around `i`, FVS dropped: back and forward to a non-letter. */
const stemFrom = (cps: readonly string[], i: number): string => {
  const part = (ch: string | undefined): ch is string =>
    ch !== undefined && (isMongolLetter(cp(ch)) || FVS.has(ch));
  let a = i;
  while (part(cps[a - 1])) a--;
  let b = i;
  while (part(cps[b])) b++;
  return cps
    .slice(a, b)
    .filter((ch) => !FVS.has(ch))
    .join('');
};

export const nonInitialO: Rule = {
  name: 'non-initial-o',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    let vowelSeen = false;
    let settled = false;
    let inPrev = false;
    for (let i = 0; i < cps.length; i++) {
      const ch = cps[i];
      if (ch === undefined) continue;
      const c = cp(ch);
      const inWord =
        isMongolLetter(c) || ch === MVS || ch === NNBSP || ch === NIRUGU || FVS.has(ch);
      if (!inWord) {
        vowelSeen = false;
        inPrev = false;
        continue;
      }
      if (!inPrev) settled = SETTLED.has(stemFrom(cps, i));
      inPrev = true;
      if (!isVowel(c)) continue;
      if ((ch === O || ch === OE) && vowelSeen) {
        out.push({
          rule: 'non-initial-o',
          severity: 'info',
          ...msg('non-initial-o/later'),
          start: i,
          end: i + 1,
          ...(settled ? { fix: ch === O ? 'ᠤ' : 'ᠦ' } : {}),
        });
      }
      vowelSeen = true;
    }
    return out;
  },
};
