import type { MessageId } from '../../src/index.js';

const MVS = '\u180e';
const NNBSP = '\u202f';
const FVS1 = '\u180b';
const FVS2 = '\u180c';

/**
 * One input per message, and the rule (by name) that emits it. Type-only
 * imports, so `scripts/build-messages-review.mjs` can load this file with
 * Node's own type stripping.
 */
export const messageSamples: Readonly<
  Record<MessageId, { rule: string; mode?: 'formal'; text: string }>
> = {
  'mvs-context/misplaced': { rule: 'mvs-context', text: `ᠨᠡᠷ ${MVS}` },
  'fvs-placement/start': { rule: 'fvs-placement', text: `${FVS1}ᠨᠡᠷ` },
  'fvs-placement/after-fvs': { rule: 'fvs-placement', text: `ᠭ${FVS1}${FVS2}ᠠ` },
  'fvs-placement/after-char': { rule: 'fvs-placement', text: `ᠨᠡᠷ ${FVS1}` },
  'no-pua/one': { rule: 'no-pua', text: '\ue000' },
  'no-pua/many': { rule: 'no-pua', text: '\ue000\ue001\ue002' },
  'detached-suffix/verbal': { rule: 'detached-suffix', text: `ᠶᠠᠪᠤ${MVS}ᠳᠠᠭ` },
  'detached-suffix/formal': { rule: 'detached-suffix', mode: 'formal', text: `ᠨᠣᠮ${MVS}ᠲᠠᠢ` },
  'wrong-block/todo': { rule: 'wrong-block', text: 'ᡆ' },
  'wrong-block/sibe': { rule: 'wrong-block', text: 'ᡠ' },
  'wrong-block/manchu': { rule: 'wrong-block', text: 'ᡴ' },
  'wrong-block/ali-gali': { rule: 'wrong-block', text: 'ᢀ' },
  'wrong-block/ali-gali-lookalike': { rule: 'wrong-block', text: 'ᢈᠣᠲᠠ' },
  'zwj-zwnj/zwj': { rule: 'zwj-zwnj', text: 'ᠠ\u200dᠨ' },
  'zwj-zwnj/zwnj': { rule: 'zwj-zwnj', text: 'ᠠ\u200c' },
  'nnbsp-legacy/connector': { rule: 'nnbsp-legacy', text: `ᠪᠢᠳᠡᠨ${NNBSP}ᠤ` },
  'nnbsp-legacy/particle': { rule: 'nnbsp-legacy', text: `ᠰᠠᠢᠨ${NNBSP}ᠤᠤ` },
  'compat-punctuation/vertical': { rule: 'compat-punctuation', text: 'ᠨᠡᠷ\ufe16' },
  'compat-punctuation/cjk': { rule: 'compat-punctuation', text: 'ᠨᠡᠷ\ufe35' },
  'compat-punctuation/small': { rule: 'compat-punctuation', text: 'ᠨᠡᠷ\ufe50' },
  'compat-punctuation/borrowed': { rule: 'compat-punctuation', text: 'ᠨᠡᠷ\u3002' },
  'unknown-suffix/particle': { rule: 'unknown-suffix', text: `ᠰᠠᠨᠠᠮᠰᠠᠷ${MVS}ᠦᠭᠡᠢ` },
  'unknown-suffix/stray-fvs': { rule: 'unknown-suffix', text: `ᠨᠡᠷ${MVS}ᠤ${FVS1}ᠳ` },
  'unknown-suffix/unknown': { rule: 'unknown-suffix', text: `ᠨᠡᠷ${MVS}ᠽᠽᠽ` },
  'doubled-ae/doubled': { rule: 'doubled-ae', text: 'ᠠᠪᠠᠠ' },
  'non-initial-o/later': { rule: 'non-initial-o', text: 'ᠮᠣᠩᠭᠣᠯ' },
  'fusable-stack/fusable': { rule: 'fusable-stack', text: `ᠨᠡᠷ${MVS}ᠳᠤ${MVS}ᠪᠠᠨ` },
};
