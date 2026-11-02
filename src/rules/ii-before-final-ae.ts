import { cp, FVS, isMongolLetter, MVS, NNBSP } from '../chars.js';
import { msg } from '../messages/index.js';
import type { Diagnostic, Rule } from '../types.js';

const I = 'ᠢ';
const YA = 'ᠶ';
const A = 'ᠠ';
const E = 'ᠡ';

const afterFvs = (cps: readonly string[], j: number): number => {
  let k = j;
  while (k < cps.length && FVS.has(cps[k] as string)) k++;
  return k;
};

/**
 * ᠢᠢ + connector + a separated final ᠠ/ᠡ, which is always ᠢᠶ (owner's ruling,
 * 2026-11-03): Сумъяа is ᠰᠤᠮᠢᠶ\u180Eᠠ `sumiy-a`, never `sumii-a`.
 *
 * The core spec (16.0 §13.5) encodes by sound, not by shape, and UTN #57 lists
 * `daliy·a` (d a l i y MVS a) for a word drawn D A L I I Á. Its shaping suites
 * have only i y MVS a/e (жишээ, aturiy-a) and no i i MVS, and Kimo writes iy-a
 * for Сумъяа, Мария, Азия, захиа.
 * In Noto Sans Mongolian the two draw the same, which is why people type the
 * wrong one.
 *
 * Narrow on purpose. A long i is written ii (`γaǰiiqu`, `qabii` Хавий), so a
 * doubled i is reported only before a connector and a lone ᠠ/ᠡ that ends the
 * word; ii + MVS + ᠶᠢᠨ or any other suffix is left alone. The vocative takes a
 * plain space, never a connector, so there is no other reading.
 *
 * The span is the pair and the fix ᠢᠶ. The connector is `nnbsp-legacy`'s, so
 * the two fixes never touch the same code point.
 */
export const iiBeforeFinalAe: Rule = {
  name: 'ii-before-final-ae',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let k = 2; k < cps.length - 1; k++) {
      const conn = cps[k];
      if (conn !== MVS && conn !== NNBSP) continue;
      if (cps[k - 1] !== I || cps[k - 2] !== I) continue;
      const vowel = cps[k + 1];
      if (vowel !== A && vowel !== E) continue;
      if (isMongolLetter(cp(cps[afterFvs(cps, k + 2)]))) continue;
      out.push({
        rule: 'ii-before-final-ae',
        severity: 'warning',
        ...msg('ii-before-final-ae/glide', { letter: vowel }),
        start: k - 2,
        end: k,
        fix: `${I}${YA}`,
      });
    }
    return out;
  },
};
