import { cp } from '../chars.js';
import { convertMenksoftToUnicode } from '../menksoft/convert.js';
import { isLetter, isMenksoft } from '../menksoft/menksoft.js';
import { msg } from '../messages/index.js';
import type { Diagnostic, Rule } from '../types.js';

const isPua = (c: number): boolean => c >= 0xe000 && c <= 0xf8ff;

/**
 * Private Use Area code points mean the text is encoded for one specific
 * legacy glyph font (the Menksoft era) — it is not interchangeable Unicode
 * Mongolian and renders as tofu everywhere else. Contiguous runs are
 * reported as one diagnostic.
 *
 * A run that lies wholly inside Menksoft's Hudum band and holds a letter
 * carries its Unicode reading as the fix. The fix is the conversion alone;
 * what the other rules think of the result they report on the next pass.
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
      const run = cps.slice(i, j);
      const menksoft = run.every((ch) => isMenksoft(cp(ch))) && run.some((ch) => isLetter(cp(ch)));
      out.push({
        rule: 'no-pua',
        severity: 'error',
        ...msg(j - i > 1 ? 'no-pua/many' : 'no-pua/one', { count: j - i }),
        start: i,
        end: j,
        ...(menksoft ? { fix: convertMenksoftToUnicode(run.join('')) } : {}),
      });
      i = j;
    }
    return out;
  },
};
