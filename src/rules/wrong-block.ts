import { cp, uplus } from '../chars.js';
import type { Diagnostic, Rule } from '../types.js';

/** U+1878 (CHA WITH TWO DOTS) is a Hudum extension and deliberately not flagged. */
const blockOf = (c: number): string | null => {
  if (c >= 0x1843 && c <= 0x185c) return 'Todo';
  if (c >= 0x185d && c <= 0x1872) return 'Sibe';
  if (c >= 0x1873 && c <= 0x1877) return 'Manchu';
  if (c >= 0x1880 && c <= 0x18aa) return 'Ali Gali';
  return null;
};

/** Known look-alikes with a mechanical Hudum replacement (real keyboards emit these). */
const LOOKALIKE_FIX: ReadonlyMap<number, string> = new Map([
  [0x1888, 'ᠬ'], // ALI GALI I → Hudum QA ᠬ (glyph look-alike, hb-view verified)
  [0x1889, 'ᠭ'], // ALI GALI KA → Hudum GA ᠭ
]);

/**
 * gege-linter lints Hudum (classic Mongolian) text; letters from the Todo,
 * Sibe, Manchu, and Ali Gali ranges are look-alikes that break search,
 * collation, and screen readers.
 */
export const wrongBlock: Rule = {
  name: 'wrong-block',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length; i++) {
      const c = cp(cps[i]);
      const block = blockOf(c);
      if (block === null) continue;
      const fix = LOOKALIKE_FIX.get(c);
      out.push({
        rule: 'wrong-block',
        severity: 'warning',
        message: `${block} letter (${uplus(c)}) in Hudum text${fix !== undefined ? ` — did you mean ${uplus(fix)}?` : ''}`,
        start: i,
        end: i + 1,
        ...(fix !== undefined ? { fix } : {}),
      });
    }
    return out;
  },
};
