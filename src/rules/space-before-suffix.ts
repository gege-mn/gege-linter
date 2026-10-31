import { cp, FVS, isMongolLetter, MVS, prevBaseCp } from '../chars.js';
import { suffixes } from '../data/suffixes.js';
import { msg } from '../messages/index.js';
import type { Diagnostic, Rule } from '../types.js';

// Particles and ᠬᠢ/ᠬᠢᠨ also stand as words in ordinary text, so a space before
// them says nothing.
const STANDALONE = new Set(['particle', 'possession']);

// Also headwords in Монгол толь (ᠪᠠᠷ бар, ᠨᠠᠷ нар, ᠲᠠᠢ тай, ᠳᠤᠷ дур…). The text
// alone cannot tell which is meant, so these are hints and carry no fix.
const HOMOGRAPHS = new Set([
  'yin',
  'ü',
  'dur',
  'dür',
  'tur',
  'tür',
  'acha',
  'bar',
  'ber',
  'tai',
  'ban',
  'nar',
  'degen',
  'tuni',
]);

const entries = suffixes
  .filter((entry) => !STANDALONE.has(entry.category))
  .map((entry) => ({ entry, seq: [...entry.sequence] }));

/**
 * A suffix after a plain U+0020 instead of a connector. No font shows the
 * difference, and the linter's other rules only ever look at connectors. The
 * words `spaceParticles` lists are not in the dictionary, so they never match.
 */
export const spaceBeforeSuffix: Rule = {
  name: 'space-before-suffix',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 1; i < cps.length; i++) {
      if (cps[i] !== ' ' || !isMongolLetter(prevBaseCp(cps, i))) continue;
      const found = entries.find(({ seq }) => {
        let j = i + 1;
        const skipFvs = () => {
          while (FVS.has(cps[j] ?? '')) j++;
        };
        for (const ch of seq) {
          if (cps[j] !== ch) return false;
          j++;
          skipFvs();
        }
        // A separated final vowel makes this a word of its own: ᠨᠡᠷ + MVS + ᠡ is нэр.
        const vowelAt = j + 1;
        if (cps[j] === MVS && (cps[vowelAt] === 'ᠠ' || cps[vowelAt] === 'ᠡ')) {
          j = vowelAt + 1;
          skipFvs();
          return isMongolLetter(cp(cps[j]));
        }
        return !isMongolLetter(cp(cps[j]));
      });
      if (!found) continue;
      const { sequence, cyrillic, translit } = found.entry;
      const data = { suffix: sequence, cyrillic };
      out.push(
        HOMOGRAPHS.has(translit)
          ? {
              rule: 'space-before-suffix',
              severity: 'info',
              ...msg('space-before-suffix/ambiguous', data),
              start: i,
              end: i + 1,
            }
          : {
              rule: 'space-before-suffix',
              severity: 'warning',
              ...msg('space-before-suffix/suffix', data),
              start: i,
              end: i + 1,
              fix: MVS,
            },
      );
    }
    return out;
  },
};
