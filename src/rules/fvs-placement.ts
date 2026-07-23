import { cp, FVS, isMongolLetter, uplus } from '../chars.js';
import type { Diagnostic, Rule } from '../types.js';

/**
 * A free variation selector modifies the letter immediately before it, so it
 * must directly follow a Mongolian letter. A doubled FVS fails the same test
 * (its predecessor is a selector, not a letter).
 */
export const fvsPlacement: Rule = {
  name: 'fvs-placement',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length; i++) {
      const ch = cps[i];
      const n = ch === undefined ? undefined : FVS.get(ch);
      if (n === undefined) continue;
      if (isMongolLetter(cp(cps[i - 1]))) continue;
      out.push({
        rule: 'fvs-placement',
        severity: 'error',
        message: `FVS${n} (${uplus(ch as string)}) must immediately follow the Mongolian letter it modifies`,
        start: i,
        end: i + 1,
      });
    }
    return out;
  },
};
