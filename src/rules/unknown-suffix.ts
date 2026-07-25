import { cp, FVS, isDigit, isMongolLetter, MVS, NNBSP, prevBaseCp } from '../chars.js';
import { suffixes } from '../data/suffixes.js';
import type { Diagnostic, Rule } from '../types.js';

/** Dictionary entries with pre-split sequences, longest first for greedy matching. */
const entries = suffixes
  .map((entry) => ({ entry, seq: [...entry.sequence] }))
  .sort((a, b) => b.seq.length - a.seq.length);

/** Index after any FVS run starting at j — FVS modifies the letter before it. */
const afterFvs = (cps: readonly string[], j: number): number => {
  while (j < cps.length) {
    const ch = cps[j];
    if (ch === undefined || !FVS.has(ch)) break;
    j++;
  }
  return j;
};

/**
 * A suffix connector (MVS, or legacy NNBSP) must introduce a letter sequence
 * from the Hudum suffix dictionary — `connectorSuffixes` in
 * @gege-mn/mongol-bichig, whose normative source is that package's
 * references/suffixes.md. Warning, not error: the dictionary is believed complete
 * for standard Hudum, but foreign names and Ali Gali text exist.
 *
 * Out of scope here: bare or misplaced connectors (mvs-context), the NNBSP
 * connector itself (nnbsp-legacy), and space-joined particles like ᠤᠤ/ᠦᠦ.
 * A lone ᠠ/ᠡ after MVS is the separated final vowel (ᠬᠠᠷ\u180Eᠠ) — or the
 * archaic dative — and is always accepted. An FVS inside the sequence
 * defeats matching on purpose: standard suffixes never need one.
 */
export const unknownSuffix: Rule = {
  name: 'unknown-suffix',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    /** Connector positions consumed by a matched multi-part entry (ᠯᠤᠭ\u180Eᠠ). */
    const consumed = new Set<number>();
    for (let i = 0; i < cps.length; i++) {
      const conn = cps[i];
      if ((conn !== MVS && conn !== NNBSP) || consumed.has(i)) continue;
      const base = prevBaseCp(cps, i);
      if (!isMongolLetter(base) && !isDigit(base)) continue;
      if (!isMongolLetter(cp(cps[i + 1]))) continue;
      if (
        (cps[i + 1] === 'ᠠ' || cps[i + 1] === 'ᠡ') &&
        !isMongolLetter(cp(cps[afterFvs(cps, i + 2)]))
      ) {
        continue;
      }
      const match = entries.find(
        ({ seq }) =>
          seq.every((ch, k) => cps[i + 1 + k] === ch) &&
          !isMongolLetter(cp(cps[afterFvs(cps, i + 1 + seq.length)])),
      );
      if (match !== undefined) {
        match.seq.forEach((ch, k) => {
          if (ch === MVS) consumed.add(i + 1 + k);
        });
        continue;
      }
      let j = i + 1;
      for (;;) {
        const ch = cps[j];
        if (ch === undefined || (!isMongolLetter(cp(ch)) && !FVS.has(ch))) break;
        j++;
      }
      const run = cps.slice(i + 1, j);
      // A run that is a dictionary suffix once stray FVS are dropped gets a
      // mechanical fix — particle shaping is automatic after the connector,
      // so the FVS is at best redundant (real case: gege.mn's ᠤ+FVS1+ᠳ).
      const repaired = entries.find(
        (e) => e.entry.sequence === run.filter((ch) => !FVS.has(ch)).join(''),
      );
      out.push({
        rule: 'unknown-suffix',
        severity: 'warning',
        message:
          repaired !== undefined
            ? `Suffix ‘${repaired.entry.sequence}’ (${repaired.entry.translit}) written with a stray FVS — particle shaping after the connector is automatic`
            : `Unknown Hudum suffix ‘${run.join('')}’ after ${conn === MVS ? 'MVS' : 'NNBSP'} — not in the suffix dictionary`,
        start: i + 1,
        end: j,
        ...(repaired !== undefined ? { fix: repaired.entry.sequence } : {}),
      });
    }
    return out;
  },
};
