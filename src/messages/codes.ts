import type { MessageId } from './index.js';

/**
 * The language-neutral name of each finding: GL, two digits for the rule in
 * the order the rules were written, two for the variant. It reads the same in
 * every locale, which a rule name or message id does not.
 *
 * Published codes are permanent. Never renumber or reuse one: a retired
 * message keeps its number unused, and a new one takes the next free variant
 * or, for a new rule, the next rule number. The two `no-pua` entries are one
 * finding in its singular and plural wording, so they share a code.
 */
export const codes: Readonly<Record<MessageId, string>> = {
  'nnbsp-legacy/connector': 'GL0101',
  'nnbsp-legacy/particle': 'GL0102',
  'mvs-context/misplaced': 'GL0201',
  'fvs-placement/start': 'GL0301',
  'fvs-placement/after-fvs': 'GL0302',
  'fvs-placement/after-char': 'GL0303',
  'no-pua/one': 'GL0401',
  'no-pua/many': 'GL0401',
  'wrong-block/todo': 'GL0501',
  'wrong-block/sibe': 'GL0502',
  'wrong-block/manchu': 'GL0503',
  'wrong-block/ali-gali': 'GL0504',
  'wrong-block/ali-gali-lookalike': 'GL0505',
  'zwj-zwnj/zwj': 'GL0601',
  'zwj-zwnj/zwnj': 'GL0602',
  'non-initial-o/later': 'GL0701',
  'unknown-suffix/unknown': 'GL0801',
  'unknown-suffix/stray-fvs': 'GL0802',
  'unknown-suffix/particle': 'GL0803',
  'fusable-stack/fusable': 'GL0901',
  'doubled-ae/doubled': 'GL1001',
  'compat-punctuation/vertical': 'GL1101',
  'compat-punctuation/cjk': 'GL1102',
  'compat-punctuation/small': 'GL1103',
  'compat-punctuation/borrowed': 'GL1104',
  'detached-suffix/verbal': 'GL1201',
  'detached-suffix/formal': 'GL1202',
};
