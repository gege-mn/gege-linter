import { cp, isMongolLetter, ZWJ, ZWNJ } from '../chars.js';
import type { Diagnostic, Rule } from '../types.js';

/**
 * Everyday Mongolian text never needs ZWJ/ZWNJ (UTN #57) — they belong in
 * charts and educational material showing positional forms in isolation; a
 * visible joining stroke is the nirugu (U+180A). Only flagged when touching
 * a Mongolian letter, so emoji ZWJ sequences stay untouched.
 */
export const zwjZwnj: Rule = {
  name: 'zwj-zwnj',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length; i++) {
      const ch = cps[i];
      if (ch !== ZWJ && ch !== ZWNJ) continue;
      if (!isMongolLetter(cp(cps[i - 1])) && !isMongolLetter(cp(cps[i + 1]))) continue;
      out.push({
        rule: 'zwj-zwnj',
        severity: 'warning',
        message: `${ch === ZWJ ? 'ZWJ (U+200D)' : 'ZWNJ (U+200C)'} beside a Mongolian letter — running text never needs it (UTN #57); use nirugu (U+180A) for a visible joining stroke`,
        start: i,
        end: i + 1,
      });
    }
    return out;
  },
};
