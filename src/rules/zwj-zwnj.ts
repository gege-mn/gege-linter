import { cp, isMongolLetter, ZWJ, ZWNJ } from '../chars.js';
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
 * A joiner *between* letters is still worth reporting: FVS1–4 is the
 * registered mechanism for a form override, and the spec warns that older
 * documentation ordered ZWJ and FVS the other way round, so a joiner sitting
 * mid-word is more often legacy debris than intent. Nothing in the corpus
 * hits this branch. Emoji ZWJ sequences never do either — both sides must be
 * Mongolian letters.
 */
export const zwjZwnj: Rule = {
  name: 'zwj-zwnj',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length; i++) {
      const ch = cps[i];
      if (ch !== ZWJ && ch !== ZWNJ) continue;
      // At a word boundary the joiner is selecting a positional form in
      // isolation — the abbreviation case, which the spec allows.
      if (!isMongolLetter(cp(cps[i - 1])) || !isMongolLetter(cp(cps[i + 1]))) continue;
      out.push({
        rule: 'zwj-zwnj',
        severity: 'warning',
        message: `${ch === ZWJ ? 'ZWJ (U+200D)' : 'ZWNJ (U+200C)'} between two Mongolian letters — a positional form is overridden with FVS1–4, not a joiner; for a visible joining stroke use nirugu (U+180A). At a word boundary a joiner is legitimate and not reported`,
        start: i,
        end: i + 1,
      });
    }
    return out;
  },
};
