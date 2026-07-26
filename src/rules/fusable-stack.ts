import { cp, FVS, isMongolLetter, MVS, NNBSP, prevBaseCp } from '../chars.js';
import { suffixes } from '../data/suffixes.js';
import type { Diagnostic, Rule } from '../types.js';

/**
 * Case suffix + reflexive stacks that a writer may also spell as one fused
 * suffix: задлаг (analytic) and нийлэг (fused) are both correct, and which one
 * you write is style. Ruled by a bichig reader on 2026-07-27; `suffixes.md`
 * records the same alternation ("Fused (нийлэг) forms exist for the dative").
 *
 * Keyed by translit, never by code points: every sequence is looked up in the
 * shared registry, so this file holds the *pairing* and mongol-bichig keeps
 * owning the letters. A pair whose entries are not in the registry drops out
 * silently rather than encoding a second copy of the dictionary here.
 */
const PAIRS: readonly (readonly [string, string, string])[] = [
  ['du', 'ban', 'daγan'],
  ['dü', 'ben', 'degen'],
  ['tu', 'ban', 'taγan'],
  ['tü', 'ben', 'tegen'],
  ['acha', 'ban', 'achaγan'],
  ['eche', 'ben', 'echegen'],
];

const sequenceOf = (translit: string): string | undefined =>
  suffixes.find((e) => e.translit === translit)?.sequence;

const STACKS = PAIRS.map(([caseSuffix, reflexive, fused]) => ({
  first: [...(sequenceOf(caseSuffix) ?? '')],
  second: [...(sequenceOf(reflexive) ?? '')],
  fused: sequenceOf(fused) ?? '',
  fusedTranslit: fused,
})).filter((s) => s.first.length > 0 && s.second.length > 0 && s.fused.length > 0);

const isConnector = (ch: string | undefined): boolean => ch === MVS || ch === NNBSP;

/** Index after any FVS run starting at j — a selector belongs to the letter before it. */
const afterFvs = (cps: readonly string[], j: number): number => {
  let k = j;
  while (k < cps.length) {
    const ch = cps[k];
    if (ch === undefined || !FVS.has(ch)) break;
    k++;
  }
  return k;
};

const matchesAt = (cps: readonly string[], at: number, seq: readonly string[]): boolean =>
  seq.every((ch, k) => cps[at + k] === ch);

/**
 * An analytic case + reflexive stack that has a registered fused equivalent.
 *
 * **Info, and deliberately without a `fix`.** Both spellings are correct, so a
 * mechanical fix would let `--fix` silently rewrite an author's style into the
 * other valid form. The fused sequence is named in the message instead; a
 * consumer that wants one-click apply — the gege.mn /type pad, say — can build
 * the replacement as connector + that sequence over the reported span.
 *
 * The corpus says this is worth surfacing: 538 analytic stacks in 4,000
 * sentences of real bichig, and not one fused form anywhere.
 */
export const fusableStack: Rule = {
  name: 'fusable-stack',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length; i++) {
      if (!isConnector(cps[i])) continue;
      if (!isMongolLetter(prevBaseCp(cps, i))) continue;
      for (const stack of STACKS) {
        if (!matchesAt(cps, i + 1, stack.first)) continue;
        const mid = i + 1 + stack.first.length;
        if (!isConnector(cps[mid])) continue;
        if (!matchesAt(cps, mid + 1, stack.second)) continue;
        const end = mid + 1 + stack.second.length;
        if (isMongolLetter(cp(cps[afterFvs(cps, end)]))) continue;
        out.push({
          rule: 'fusable-stack',
          severity: 'info',
          message: `‘${stack.first.join('')}’ + ‘${stack.second.join('')}’ may also be written as the fused ‘${stack.fused}’ (${stack.fusedTranslit}) — both are correct`,
          start: i,
          end,
        });
        break;
      }
    }
    return out;
  },
};
