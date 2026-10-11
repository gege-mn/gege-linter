import { cp, FVS, isMongolLetter, MVS, NNBSP, prevBaseCp } from '../chars.js';
import type { Diagnostic, Rule } from '../types.js';

interface Ending {
  seq: readonly string[];
  cyrillic: string;
  formal: boolean;
}

const ending = (sequence: string, cyrillic: string, formal: boolean): Ending => ({
  seq: [...sequence],
  cyrillic,
  formal,
});

// Held here, not read from the suffix dictionary: the dictionary lists what a
// connector may introduce, and these are the endings it may not.
const ENDINGS: readonly Ending[] = [
  ending('\u1833\u1820\u182d', '-даг', false),
  ending('\u1833\u1821\u182d', '-дэг', false),
  ending('\u1832\u1820\u1822', '-тай', true),
  ending('\u1832\u1821\u1822', '-тэй', true),
  ending('\u1833\u1824\u182d\u1820\u1837', '-дугаар', true),
  ending('\u1833\u1826\u182d\u1821\u1837', '-дүгээр', true),
  ending('\u1833\u1820\u182c\u1822', '-дахь', true),
  ending('\u1833\u1821\u182c\u1822', '-дэх', true),
];

const A = '\u1820';
const E = '\u1821';

/**
 * The ending this rule reports at connector `i`, if any. `nnbsp-legacy` and
 * `unknown-suffix` ask the same question so that no two rules answer for one
 * connector.
 */
export function detachedAt(cps: readonly string[], i: number, formal: boolean): Ending | undefined {
  const conn = cps[i];
  if (conn !== MVS && conn !== NNBSP) return undefined;
  // A digit is not a stem: how a suffix joins one is unspecified.
  if (!isMongolLetter(prevBaseCp(cps, i))) return undefined;
  return ENDINGS.find((e) => {
    if (e.formal && !formal) return false;
    if (!e.seq.every((ch, k) => cps[i + 1 + k] === ch)) return false;
    let j = i + 1 + e.seq.length;
    while (FVS.has(cps[j] ?? '')) j++;
    return !isMongolLetter(cp(cps[j]));
  });
}

const make = (formal: boolean): Rule => ({
  name: 'detached-suffix',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length; i++) {
      const found = detachedAt(cps, i, formal);
      if (found === undefined) continue;
      // A separated final a/e (stem + MVS + vowel) becomes an ordinary medial
      // vowel once a suffix is attached, so its MVS goes too.
      let b = i - 1;
      while (b > 0 && FVS.has(cps[b] ?? '')) b--;
      const separated = (cps[b] === A || cps[b] === E) && cps[b - 1] === MVS;
      const written = found.seq.join('');
      out.push({
        rule: 'detached-suffix',
        severity: found.formal ? 'warning' : 'error',
        message: found.formal
          ? `‘${written}’ (${found.cyrillic}) is written attached to the stem in formal documents — remove the connector`
          : `‘${written}’ (${found.cyrillic}) is a verbal ending, always written attached to the stem — remove the connector`,
        start: separated ? b - 1 : i,
        end: i + 1,
        fix: separated ? cps.slice(b, i).join('') : '',
      });
    }
    return out;
  },
});

/**
 * An ending that belongs on the stem, written after a suffix connector (MVS,
 * or legacy NNBSP) instead. The fix attaches it.
 *
 * The habitual -даг/-дэг has no detached form at all: an error everywhere.
 */
export const detachedSuffix: Rule = make(false);

/**
 * `detachedSuffix` plus the endings that may be connector-joined in ordinary
 * text but are attached in legal and other formal documents: the comitative
 * -тай/-тэй and the ordinals -дугаар/-дүгээр, -дахь/-дэх. Those are warnings.
 */
export const detachedSuffixFormal: Rule = make(true);
