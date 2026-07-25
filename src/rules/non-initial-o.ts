import { cp, FVS, isMongolLetter, isVowel, MVS, NIRUGU, NNBSP } from '../chars.js';
import type { Diagnostic, Rule } from '../types.js';

const O = 'ᠣ';
const OE = 'ᠥ';

/**
 * Dumb static vowel-position check: in native Hudum orthography O/Ö appear
 * only in a word's first syllable — later round vowels are written U/Ü.
 *
 * The rule is categorical, so ᠮᠣᠩᠭᠣᠯ is a real hit and not an exception:
 * the correct spelling is ᠮᠣᠩᠭᠤᠯ. This reverses what the rule's own notes
 * claimed until 2026-07-26 — a bichig reader ruled on it, and kimo/Tungaamal
 * applies the rule everywhere else in its own output (ᠪᠣᠭᠤᠨᠢ, ᠣᠷᠤᠢ,
 * ᠲᠣᠭᠤᠭ\u180Eᠠ) while exempting only this one word.
 *
 * Info severity on purpose all the same: loanwords keep their o (ᠹᠣᠲᠣ,
 * ᠻᠢᠨᠣ) and a few native words are genuine lexical exceptions — ᠭᠣᠣᠯ has a
 * doubled short o. So this stays a "look here" hint, never an error.
 */
export const nonInitialO: Rule = {
  name: 'non-initial-o',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    let vowelSeen = false;
    for (let i = 0; i < cps.length; i++) {
      const ch = cps[i];
      if (ch === undefined) continue;
      const c = cp(ch);
      const inWord =
        isMongolLetter(c) || ch === MVS || ch === NNBSP || ch === NIRUGU || FVS.has(ch);
      if (!inWord) {
        vowelSeen = false;
        continue;
      }
      if (!isVowel(c)) continue;
      if ((ch === O || ch === OE) && vowelSeen) {
        out.push({
          rule: 'non-initial-o',
          severity: 'info',
          message:
            'O/Ö (U+1823/U+1825) normally occurs only in the first syllable — later syllables use U/Ü (U+1824/U+1826); loanwords and a few lexical exceptions are fine',
          start: i,
          end: i + 1,
        });
      }
      vowelSeen = true;
    }
    return out;
  },
};
