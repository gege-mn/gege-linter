import { cp, isMongolLetter, ZWJ, ZWNJ } from '../chars.js';
import { msg } from '../messages/index.js';
import type { Diagnostic, Rule } from '../types.js';

/**
 * ZWJ/ZWNJ **between two Mongolian letters**.
 *
 * The core spec (16.0 §13.5) sanctions two uses: selecting "a particular
 * positional form of a letter in isolation" — `<1820 200D>` for the initial
 * form, `<200D 1820>` for the final, `<200D 1820 200D>` for the medial — and
 * overriding "the expected positional form within a word".
 *
 * Only the second is flagged, because the first is how bichig writes
 * **abbreviations**: ЗХУ is each letter followed by ZWJ and a comma
 * (`182A 1820 200D 1802 …`), the joiner holding an initial form that would
 * otherwise go final before the punctuation. A bichig reader confirmed on
 * 2026-07-27 that most sources write them this way, and all 85 joiners in
 * 35,320 harvested words and 4,000 sentences are that pattern — every one of
 * them a false positive under the rule's earlier blanket form.
 *
 * A ZWJ *between* letters is still worth reporting: FVS1–4 is the registered
 * mechanism for a form override, and the spec warns that older documentation
 * ordered ZWJ and FVS the other way round, so a joiner sitting mid-word is
 * more often legacy debris than intent. Nothing in the corpus hits this
 * branch. Emoji ZWJ sequences never do either — both sides must be Mongolian
 * letters.
 *
 * **The boundary exemption is ZWJ-only.** The spec sentence names both
 * characters, but every piece of supporting evidence is ZWJ's: the tabulated
 * sequences, the abbreviation pattern, and all 85 corpus hits. A boundary
 * ZWNJ selects nothing — a letter at a word edge is already non-joining on
 * that side — so it is the redundant debris this rule exists to find, and
 * stays reported wherever it touches a Mongolian letter.
 */
export const zwjZwnj: Rule = {
  name: 'zwj-zwnj',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length; i++) {
      const ch = cps[i];
      if (ch !== ZWJ && ch !== ZWNJ) continue;
      const left = isMongolLetter(cp(cps[i - 1]));
      const right = isMongolLetter(cp(cps[i + 1]));
      // A ZWJ at a word boundary is selecting a positional form in isolation —
      // the abbreviation case, which the spec allows — so it is reported only
      // between two letters. ZWNJ gets no such pass: at an edge it selects
      // nothing that default shaping would not already do.
      if (!(ch === ZWJ ? left && right : left || right)) continue;
      out.push({
        rule: 'zwj-zwnj',
        severity: 'warning',
        ...msg(ch === ZWJ ? 'zwj-zwnj/zwj' : 'zwj-zwnj/zwnj'),
        start: i,
        end: i + 1,
      });
    }
    return out;
  },
};
