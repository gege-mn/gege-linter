import { cp } from '../chars.js';
import type { Diagnostic, Rule } from '../types.js';

const isPua = (c: number): boolean => c >= 0xe000 && c <= 0xf8ff;

/**
 * Private Use Area code points mean the text is encoded for one specific
 * legacy glyph font (the Menksoft era) — it is not interchangeable Unicode
 * Mongolian and renders as tofu everywhere else. Contiguous runs are
 * reported as one diagnostic.
 */
export const noPua: Rule = {
  name: 'no-pua',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    let i = 0;
    while (i < cps.length) {
      if (!isPua(cp(cps[i]))) {
        i++;
        continue;
      }
      let j = i + 1;
      while (j < cps.length && isPua(cp(cps[j]))) j++;
      out.push({
        rule: 'no-pua',
        severity: 'error',
        message: `${j - i} Private Use Area code point${j - i > 1 ? 's' : ''} — legacy glyph encoding (Menksoft era), not interchangeable Unicode Mongolian`,
        start: i,
        end: j,
      });
      i = j;
    }
    return out;
  },
};
