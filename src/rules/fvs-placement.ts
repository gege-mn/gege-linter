import { cp, FVS, isMongolLetter, uplus } from '../chars.js';
import type { Diagnostic, Rule } from '../types.js';

/**
 * A free variation selector modifies the letter immediately before it, so it
 * must directly follow a Mongolian letter. A doubled FVS fails the same test
 * (its predecessor is a selector, not a letter).
 *
 * The message names what the selector actually landed on. Without that, a
 * doubled FVS reads as a complaint about the visible letter before it — which
 * is how a reader misread the one real error in a 31,320-word harvest on
 * 2026-07-27, ruling it a false alarm for a claim the rule was not making.
 */
const landedOn = (prev: string | undefined): string => {
  if (prev === undefined) return 'starts the text';
  const n = FVS.get(prev);
  if (n !== undefined) return `follows FVS${n} (${uplus(prev)})`;
  return `follows ${uplus(prev)}`;
};

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
        message: `FVS${n} (${uplus(ch as string)}) ${landedOn(cps[i - 1])} — a variation selector must immediately follow the Mongolian letter it modifies`,
        start: i,
        end: i + 1,
      });
    }
    return out;
  },
};
