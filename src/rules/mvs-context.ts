import { cp, isDigit, isMongolLetter, MVS, prevBaseCp } from '../chars.js';
import type { Diagnostic, Rule } from '../types.js';

/**
 * MVS (U+180E) is only meaningful joining a suffix, or a separated final
 * a/e, to what precedes it. Anywhere else it is structurally broken, and
 * fonts render a visible nominal glyph by design. The left context looks
 * through FVS (a stem may end in an FVS-modified letter) and accepts digits
 * (UTN #57 leaves digit suffixation unspecified — not an error).
 */
export const mvsContext: Rule = {
  name: 'mvs-context',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length; i++) {
      if (cps[i] !== MVS) continue;
      const base = prevBaseCp(cps, i);
      if ((isMongolLetter(base) || isDigit(base)) && isMongolLetter(cp(cps[i + 1]))) continue;
      out.push({
        rule: 'mvs-context',
        severity: 'error',
        message:
          'MVS (U+180E) must sit between two Mongolian letters (stem–suffix, or a separated final a/e)',
        start: i,
        end: i + 1,
      });
    }
    return out;
  },
};
