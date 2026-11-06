import { fvsStatus, type JoiningPosition } from '@gege-mn/mongol-bichig';
import { cp, FVS, isHudumLetter, isMongolLetter, uplus } from '../chars.js';
import { msg } from '../messages/index.js';
import type { Diagnostic, Rule } from '../types.js';

const CHA_WITH_TWO_DOTS = 0x1878;
const SIBE_SYLLABLE_BOUNDARY = 0x1807;
const MONGOLIAN_TODO_HYPHEN = 0x1806;

/**
 * Characters whose effect on the neighbouring letter's joining position this
 * rule does not model (MVS, NNBSP, ZWJ, ZWNJ, nirugu and the two Mongolian
 * marks). Next to one, the check falls back to the per-letter table, which is
 * exact for an FVS the letter has in no position and silent otherwise.
 */
const MODELLED = (c: number): boolean =>
  !(
    c === 0x180e ||
    c === 0x202f ||
    c === 0x200d ||
    c === 0x200c ||
    c === 0x180a ||
    c === SIBE_SYLLABLE_BOUNDARY ||
    c === MONGOLIAN_TODO_HYPHEN
  );

const skipFvs = (cps: readonly string[], k: number, step: 1 | -1): number => {
  let j = k;
  while (j >= 0 && j < cps.length && FVS.has(cps[j] as string)) j += step;
  return j;
};

const positionOf = (cps: readonly string[], i: number): JoiningPosition | undefined => {
  const before = cp(cps[skipFvs(cps, i - 1, -1)]);
  const after = cp(cps[skipFvs(cps, i + 1, 1)]);
  if (!MODELLED(before) || !MODELLED(after)) return undefined;
  if (isMongolLetter(before)) return isMongolLetter(after) ? 'medi' : 'fina';
  return isMongolLetter(after) ? 'init' : 'isol';
};

/**
 * An FVS after a Hudum letter that selects no Hudum form there, checked
 * against mongfontbuilder's MNG locale through `fvsStatus` (mongol-bichig
 * 0.3.1). The UCD list alone would accept Manchu-only forms in Hudum text.
 *
 * Only Hudum bases: a Todo, Sibe, Manchu or Ali Gali letter is already
 * `wrong-block`'s, and the six sequences Unicode 18.0 marks `not in use` all
 * sit on such letters. A selector with no letter before it is
 * `fvs-placement`'s.
 *
 * No fix. Deleting the selector is what a conforming font already does, but a
 * wrong FVS usually means the writer wanted a different form, and only a
 * reader can say which.
 */
export const fvsUnregistered: Rule = {
  name: 'fvs-unregistered',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length - 1; i++) {
      const base = cp(cps[i]);
      if (!isHudumLetter(base) && base !== CHA_WITH_TWO_DOTS) continue;
      const sel = cps[i + 1] as string;
      const n = FVS.get(sel);
      if (n === undefined) continue;
      const status = fvsStatus(base, n, positionOf(cps, i));
      if (status === 'registered') continue;
      const data = { n, char: uplus(sel), letter: cps[i] as string, base: uplus(cps[i] as string) };
      out.push({
        rule: 'fvs-unregistered',
        severity: 'warning',
        ...(status === 'other-writing-system'
          ? msg('fvs-unregistered/other-script', data)
          : msg('fvs-unregistered/unregistered', data)),
        start: i + 1,
        end: i + 2,
      });
    }
    return out;
  },
};
