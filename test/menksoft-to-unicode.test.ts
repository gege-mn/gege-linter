import { describe, expect, it } from 'vitest';
import { isMenksoft, lint, menksoftToUnicode } from '../src/index.js';

const MVS = '\u180E';
/** ᠪᠢᠴᠢᠭ in Menksoft glyphs. */
const BICHIG = '\uE2C1\uE27F\uE317\uE27E\uE2E8';
/** Menksoft's suffix space. */
const SFX = '\uE263';

describe('menksoftToUnicode', () => {
  it('reads glyphs back as letters', () => {
    expect(menksoftToUnicode(BICHIG)).toBe('ᠪᠢᠴᠢᠭ');
  });

  it('joins a suffix with MVS', () => {
    expect(menksoftToUnicode(`${BICHIG}${SFX}\uE321\uE27E\uE2B5`)).toBe(`ᠪᠢᠴᠢᠭ${MVS}ᠶᠢᠨ`);
  });

  it('gives a particle a plain space, where the suffix space alone says MVS', () => {
    expect(menksoftToUnicode(`${BICHIG}${SFX}\uE292\uE28D`)).toBe('ᠪᠢᠴᠢᠭ ᠤᠤ');
  });

  it('gives a run the dictionary does not know a plain space too', () => {
    expect(menksoftToUnicode(`${BICHIG}${SFX}${BICHIG}`)).toBe('ᠪᠢᠴᠢᠭ ᠪᠢᠴᠢᠭ');
  });

  it('writes the settled spelling of a word that has one', () => {
    expect(menksoftToUnicode('\uE2F2\uE289\uE2BC\uE2EC\uE289\uE2F9')).toBe('ᠮᠣᠩᠭᠤᠯ');
  });

  it('writes Mongolian punctuation, not the vertical presentation forms', () => {
    expect(menksoftToUnicode(`${BICHIG}\uE25D`)).toBe('ᠪᠢᠴᠢᠭ\u1802');
  });

  it('leaves everything that is not Menksoft alone', () => {
    expect(menksoftToUnicode(`abc ᠪᠢᠴᠢᠭ ${BICHIG}`)).toBe('abc ᠪᠢᠴᠢᠭ ᠪᠢᠴᠢᠭ');
  });

  it('produces text the linter accepts', () => {
    const out = menksoftToUnicode(`${BICHIG}${SFX}\uE321\uE27E\uE2B5 ${BICHIG}${SFX}\uE292\uE28D`);
    expect(lint(out)).toEqual([]);
  });
});

describe('isMenksoft', () => {
  it('is true for text with a Menksoft letter', () => {
    expect(isMenksoft(BICHIG)).toBe(true);
    expect(isMenksoft(`abc ᠪᠢᠴᠢᠭ ${BICHIG}`)).toBe(true);
  });

  it('is false for standard Unicode and for plain text', () => {
    expect(isMenksoft('ᠪᠢᠴᠢᠭ')).toBe(false);
    expect(isMenksoft('abc')).toBe(false);
    expect(isMenksoft('')).toBe(false);
  });

  it('is false once any PUA code point lies outside the band', () => {
    expect(isMenksoft(`${BICHIG}\uE000`)).toBe(false);
    expect(isMenksoft(`${BICHIG}\uE350`)).toBe(false);
  });

  it('is false for Menksoft punctuation with no letter', () => {
    expect(isMenksoft('\uE25D')).toBe(false);
  });
});
