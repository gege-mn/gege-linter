import { cp, isDigit, isMongolLetter, MVS, NNBSP, prevBaseCp } from '../chars.js';
import { spaceParticles } from '../data/suffixes.js';
import { msg } from '../messages/index.js';
import type { Diagnostic, Rule } from '../types.js';
import { detachedAt } from './detached-suffix.js';

/** ᠤᠤ/ᠦᠦ/ᠪᠦᠦ/ᠦᠭᠡᠢ, longest first so ᠦᠭᠡᠢ wins over a shorter prefix. */
const PARTICLES = spaceParticles
  .map((entry) => [...entry.sequence])
  .sort((a, b) => b.length - a.length);

/** Whether a space particle starts at `j` and ends the word there. */
const particleAt = (cps: readonly string[], j: number): boolean =>
  PARTICLES.some(
    (seq) => seq.every((ch, k) => cps[j + k] === ch) && !isMongolLetter(cp(cps[j + seq.length])),
  );

/**
 * NNBSP (U+202F) was the suffix connector until Unicode 16.0 (2024) moved
 * that role to MVS (U+180E). Flag NNBSP attaching a suffix as legacy, with a
 * one-code-point MVS fix. The left context looks through FVS (stems may end
 * in an FVS-modified letter) and accepts digits (᠑᠐ + NNBSP + suffix was the
 * legacy digit pattern); digit grouping (12 345) never matches because the
 * right side must be a Mongolian letter.
 *
 * The fix is **not** always MVS. ᠤᠤ/ᠦᠦ/ᠪᠦᠦ/ᠦᠭᠡᠢ are separate words that take
 * a plain U+0020 and must never be connector-joined at all, so NNBSP before
 * one of them is corrected to a space rather than swapped for another
 * connector. Emitting MVS there just trades a legacy bug for a current one —
 * and it is a live case, not a hypothetical: Tungaamal writes
 * ᠦᠭᠡᠢ<NNBSP>ᠦᠦ in ordinary text.
 *
 * Silent where `detached-suffix` reports the connector: its fix deletes the
 * NNBSP, and a second fix on the same code point would corrupt `applyFixes`.
 */
const make = (formal: boolean): Rule => ({
  name: 'nnbsp-legacy',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length; i++) {
      if (cps[i] !== NNBSP) continue;
      const base = prevBaseCp(cps, i);
      if (!isMongolLetter(base) && !isDigit(base)) continue;
      if (!isMongolLetter(cp(cps[i + 1]))) continue;
      if (detachedAt(cps, i, formal) !== undefined) continue;
      const beforeParticle = particleAt(cps, i + 1);
      out.push({
        rule: 'nnbsp-legacy',
        severity: 'warning',
        ...msg(beforeParticle ? 'nnbsp-legacy/particle' : 'nnbsp-legacy/connector'),
        start: i,
        end: i + 1,
        fix: beforeParticle ? ' ' : MVS,
      });
    }
    return out;
  },
});

export const nnbspLegacy: Rule = make(false);

/** `nnbspLegacy` for a rule set that runs `detachedSuffixFormal`. */
export const nnbspLegacyFormal: Rule = make(true);
