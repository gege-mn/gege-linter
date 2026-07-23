import { cp, isDigit, isMongolLetter, MVS, NNBSP, prevBaseCp } from '../chars.js';
import type { Diagnostic, Rule } from '../types.js';

/**
 * NNBSP (U+202F) was the suffix connector until Unicode 16.0 (2024) moved
 * that role to MVS (U+180E). Flag NNBSP attaching a suffix as legacy, with a
 * one-code-point MVS fix. The left context looks through FVS (stems may end
 * in an FVS-modified letter) and accepts digits (᠑᠐ + NNBSP + suffix was the
 * legacy digit pattern); digit grouping (12 345) never matches because the
 * right side must be a Mongolian letter.
 */
export const nnbspLegacy: Rule = {
  name: 'nnbsp-legacy',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length; i++) {
      if (cps[i] !== NNBSP) continue;
      const base = prevBaseCp(cps, i);
      if (!isMongolLetter(base) && !isDigit(base)) continue;
      if (!isMongolLetter(cp(cps[i + 1]))) continue;
      out.push({
        rule: 'nnbsp-legacy',
        severity: 'warning',
        message: 'NNBSP (U+202F) suffix connector is legacy since Unicode 16.0 — use MVS (U+180E)',
        start: i,
        end: i + 1,
        fix: MVS,
      });
    }
    return out;
  },
};
