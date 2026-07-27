import type { Diagnostic, Rule } from '../types.js';

/** A (U+1820) and E (U+1821) — the two vowels that never legitimately double. */
const A = 'ᠠ';
const E = 'ᠡ';

/**
 * Adjacent ᠠᠠ or ᠡᠡ.
 *
 * Long a/e are not written as a doubled vowel in Hudum — they take the γ/g
 * hiatus (aγa, ege, oγo, egü …), so an adjacent pair is a typo or a
 * letter-for-letter transliteration of Cyrillic аа/ээ. `orthography.md` in
 * mongol-bichig records the rule; a bichig reader confirmed the diagnosis on
 * 2026-07-27 and named both populations behind it: a reflexive that should
 * have been ᠢᠶᠠᠨ/ᠢᠶᠡᠨ (адмиралаа, аюулаа), and the vocative used for calling
 * someone, which is a **single** ᠠ/ᠡ written as its own word (аав аа).
 *
 * Doubling is specific to a/e. ᠣᠣ is a real spelling — it marks a *short* o in
 * ᠭᠣᠣᠯ, ᠳᠣᠣᠷ\u180Eᠠ — and ᠤᠤ/ᠦᠦ are the question particles, so neither is touched
 * here.
 *
 * **Warning with no fix.** Which repair is right depends on what the writer
 * meant: the reflexive wants a four-letter suffix, the vocative wants one
 * letter and a space. Guessing between them would corrupt one case to fix the
 * other.
 */
export const doubledAe: Rule = {
  name: 'doubled-ae',
  check(text) {
    const out: Diagnostic[] = [];
    const cps = [...text];
    for (let i = 0; i < cps.length - 1; i++) {
      const ch = cps[i];
      if ((ch !== A && ch !== E) || cps[i + 1] !== ch) continue;
      // Report a run of three or more once, not twice.
      let end = i + 2;
      while (cps[end] === ch) end++;
      const name = ch === A ? 'ᠠ (U+1820)' : 'ᠡ (U+1821)';
      out.push({
        rule: 'doubled-ae',
        severity: 'warning',
        message: `Doubled ${name} — long a/e are written with the γ/g hiatus, never doubled, so this is usually Cyrillic аа/ээ copied letter for letter (the reflexive is ᠢᠶᠠᠨ/ᠢᠶᠡᠨ; the vocative is a single ᠠ/ᠡ as its own word)`,
        start: i,
        end,
      });
      i = end - 1;
    }
    return out;
  },
};
