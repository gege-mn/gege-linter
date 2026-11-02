import { describe, expect, it } from 'vitest';
import {
  applyFixes,
  formalRules,
  iiBeforeFinalAe,
  lint,
  nnbspLegacy,
  rules,
} from '../src/index.js';

const MVS = '\u180E';
const NNBSP = '\u202F';
const FVS1 = '\u180B';

const only = (text: string) => lint(text, [iiBeforeFinalAe]);

describe('ii-before-final-ae', () => {
  it('flags ᠰᠤᠮᠢᠢ + MVS + ᠠ (Сумъяа), with the pair as the span and ᠢᠶ as the fix', () => {
    const ds = only(`ᠰᠤᠮᠢᠢ${MVS}ᠠ`);
    expect(ds).toHaveLength(1);
    expect(ds[0]).toMatchObject({
      rule: 'ii-before-final-ae',
      code: 'GL1401',
      severity: 'warning',
      start: 3,
      end: 5,
      fix: 'ᠢᠶ',
      data: { letter: 'ᠠ' },
    });
    expect(applyFixes(`ᠰᠤᠮᠢᠢ${MVS}ᠠ`, ds)).toBe(`ᠰᠤᠮᠢᠶ${MVS}ᠠ`);
  });

  it('flags the feminine ᠢᠢ + MVS + ᠡ (жишээ)', () => {
    const text = `ᠵᠢᠰᠢᠢ${MVS}ᠡ`;
    expect(only(text)).toMatchObject([{ data: { letter: 'ᠡ' } }]);
    expect(applyFixes(text, only(text))).toBe(`ᠵᠢᠰᠢᠶ${MVS}ᠡ`);
  });

  it('flags the legacy NNBSP connector too', () => {
    expect(only(`ᠵᠠᠬᠢᠢ${NNBSP}ᠠ`)).toHaveLength(1);
  });

  it('flags a word followed by a space, punctuation or a further suffix', () => {
    expect(only(`ᠠᠳᠢᠢ${MVS}ᠠ ᠪᠠᠶᠢᠨ`)).toHaveLength(1);
    expect(only(`ᠠᠳᠢᠢ${MVS}ᠠ᠃`)).toHaveLength(1);
    expect(only(`ᠠᠳᠢᠢ${MVS}ᠠ${MVS}ᠶᠢᠨ`)).toHaveLength(1);
  });

  it('looks through an FVS on the final vowel', () => {
    expect(only(`ᠮᠠᠷᠢᠢ${MVS}ᠠ${FVS1}`)).toHaveLength(1);
  });

  it('reports every word in a text', () => {
    const ds = only(`ᠰᠤᠮᠢᠢ${MVS}ᠠ ᠮᠠᠷᠢᠢ${MVS}ᠠ ᠵᠢᠰᠢᠢ${MVS}ᠡ`);
    expect(ds.map((d) => d.start)).toEqual([3, 11, 19]);
  });

  it('leaves the right spelling alone', () => {
    expect(only(`ᠰᠤᠮᠢᠶ${MVS}ᠠ`)).toEqual([]);
    expect(only(`ᠵᠢᠰᠢᠶ${MVS}ᠡ`)).toEqual([]);
  });

  it('leaves a single ᠢ before MVS + ᠠ alone', () => {
    expect(only(`ᠰᠤᠮᠢ${MVS}ᠠ`)).toEqual([]);
  });

  it('leaves a long ii elsewhere alone', () => {
    for (const w of ['ᠭᠠᠵᠢᠢᠬᠤ', 'ᠬᠠᠪᠢᠢ', 'ᠬᠠᠪᠢᠢ ᠠ', 'ᠰᠢᠢᠳᠬᠡᠯ']) expect(only(w), w).toEqual([]);
  });

  it('leaves ii + connector + any other suffix alone', () => {
    for (const s of ['ᠶᠢᠨ', 'ᠶᠢ', 'ᠳᠤ', 'ᠠᠴᠠ', 'ᠠᠷ', 'ᠢᠶᠠᠨ']) {
      expect(only(`ᠬᠠᠪᠢᠢ${MVS}${s}`), s).toEqual([]);
      expect(only(`ᠬᠠᠪᠢᠢ${NNBSP}${s}`), s).toEqual([]);
    }
  });

  it('leaves ii + a with no connector, or a plain space, alone', () => {
    expect(only('ᠰᠤᠮᠢᠢᠠ')).toEqual([]);
    expect(only('ᠰᠤᠮᠢᠢ ᠠ')).toEqual([]);
  });

  it('is in the default rules and the formal rules', () => {
    expect(rules).toContain(iiBeforeFinalAe);
    expect(formalRules).toContain(iiBeforeFinalAe);
  });
});

describe('ii-before-final-ae with nnbsp-legacy', () => {
  it('both fixes apply in one pass: ᠢᠢ + NNBSP + ᠠ becomes ᠢᠶ + MVS + ᠠ', () => {
    const text = `ᠰᠤᠮᠢᠢ${NNBSP}ᠠ`;
    const ds = lint(text, [iiBeforeFinalAe, nnbspLegacy]);
    expect(ds.map((d) => d.rule)).toEqual(['ii-before-final-ae', 'nnbsp-legacy']);
    expect(applyFixes(text, ds)).toBe(`ᠰᠤᠮᠢᠶ${MVS}ᠠ`);
  });

  it('leaves the default set nothing more to fix', () => {
    const text = `ᠰᠤᠮᠢᠢ${NNBSP}ᠠ ᠵᠢᠰᠢᠢ${NNBSP}ᠡ ᠬᠠᠪᠢᠢ${NNBSP}ᠶᠢᠨ`;
    const fixed = applyFixes(text, lint(text));
    expect(fixed).toBe(`ᠰᠤᠮᠢᠶ${MVS}ᠠ ᠵᠢᠰᠢᠶ${MVS}ᠡ ᠬᠠᠪᠢᠢ${MVS}ᠶᠢᠨ`);
    expect(lint(fixed).filter((d) => d.fix !== undefined)).toEqual([]);
  });

  it('the same in formal mode', () => {
    const text = `ᠰᠤᠮᠢᠢ${NNBSP}ᠠ`;
    expect(applyFixes(text, lint(text, formalRules))).toBe(`ᠰᠤᠮᠢᠶ${MVS}ᠠ`);
  });
});
