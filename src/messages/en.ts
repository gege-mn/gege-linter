/**
 * The source catalog: every other locale translates these strings, and the
 * placeholder names in them type the `data` a rule must pass. `{name}` is the
 * only syntax there is — no plurals, no selects — so a variant that needs
 * different words gets its own id instead.
 */
export const en = {
  'mvs-context/misplaced':
    'MVS (U+180E) must sit between two Mongolian letters (stem–suffix, or a separated final a/e)',
  'fvs-placement/start':
    'FVS{n} ({char}) starts the text — a variation selector must immediately follow the Mongolian letter it modifies',
  'fvs-placement/after-fvs':
    'FVS{n} ({char}) follows FVS{prevN} ({prev}) — a variation selector must immediately follow the Mongolian letter it modifies',
  'fvs-placement/after-char':
    'FVS{n} ({char}) follows {prev} — a variation selector must immediately follow the Mongolian letter it modifies',
  'no-pua/one':
    '{count} Private Use Area code point — legacy glyph encoding (Menksoft era), not interchangeable Unicode Mongolian',
  'no-pua/many':
    '{count} Private Use Area code points — legacy glyph encoding (Menksoft era), not interchangeable Unicode Mongolian',
  'detached-suffix/verbal':
    '‘{suffix}’ ({cyrillic}) is a verbal ending, always written attached to the stem — remove the connector',
  'detached-suffix/formal':
    '‘{suffix}’ ({cyrillic}) is written attached to the stem in formal documents — remove the connector',
  'wrong-block/todo': 'Todo letter ({char}) in Hudum text',
  'wrong-block/sibe': 'Sibe letter ({char}) in Hudum text',
  'wrong-block/manchu': 'Manchu letter ({char}) in Hudum text',
  'wrong-block/ali-gali': 'Ali Gali letter ({char}) in Hudum text',
  'wrong-block/ali-gali-lookalike':
    'Ali Gali letter ({char}) in Hudum text — did you mean {target}?',
  'zwj-zwnj/zwj':
    'ZWJ (U+200D) between two Mongolian letters — a positional form is overridden with FVS1–4, not a joiner; for a visible joining stroke use nirugu (U+180A). At a word boundary, where it selects a form in isolation, a ZWJ is legitimate and not reported',
  'zwj-zwnj/zwnj':
    'ZWNJ (U+200C) beside a Mongolian letter — it breaks the join mid-word, where FVS1–4 is the mechanism for a form override, and selects nothing at a word edge that default shaping would not already do',
  'nnbsp-legacy/connector':
    'NNBSP (U+202F) suffix connector is legacy since Unicode 16.0 — use MVS (U+180E)',
  'nnbsp-legacy/particle':
    'NNBSP (U+202F) before a space-joined particle — these are separate words and take a plain space, not a connector',
  'compat-punctuation/vertical':
    'vertical presentation form (GB 18030 round-trip) {char} — a compatibility character, not for interchange; write {target} and let the font supply the vertical glyph',
  'compat-punctuation/cjk':
    'CJK compatibility form (CNS 11643 round-trip) {char} — a compatibility character, not for interchange; write {target} and let the font supply the vertical glyph',
  'compat-punctuation/small':
    'small form variant (CNS 11643 round-trip) {char} — a compatibility character, not for interchange; write {target} and let the font supply the vertical glyph',
  'compat-punctuation/borrowed':
    '{char} is Chinese-borrowed punctuation — core spec 13.5 gives it to Todo and Sibe; Hudum writes {target}',
  'unknown-suffix/particle':
    '‘{word}’ ({cyrillic}) is a separate word, not a suffix — it takes a plain space, never a connector',
  'unknown-suffix/stray-fvs':
    'Suffix ‘{suffix}’ ({translit}) written with a stray FVS — particle shaping after the connector is automatic',
  'unknown-suffix/unknown':
    'Unknown Hudum suffix ‘{suffix}’ after {connector} — not in the suffix dictionary',
  'doubled-ae/doubled':
    'Doubled {letter} ({char}) — long a/e are written with the γ/g hiatus, never doubled, so this is usually Cyrillic аа/ээ copied letter for letter (the reflexive is ᠢᠶᠠᠨ/ᠢᠶᠡᠨ; the vocative is a single ᠠ/ᠡ as its own word)',
  'non-initial-o/later':
    'O/Ö (U+1823/U+1825) normally occurs only in the first syllable — later syllables use U/Ü (U+1824/U+1826); loanwords and a few lexical exceptions are fine',
  'fusable-stack/fusable':
    '‘{first}’ + ‘{second}’ may also be written as the fused ‘{fused}’ ({translit}) — both are correct',
} as const;
