import { describe, expect, it } from 'vitest';
import { applyFixes, isTungaamal, lint, tungaamalToUnicode } from '../src/index.js';

const NNBSP = '\u202F';
const MVS = '\u180E';
const FVS1 = '\u180B';
/** What Tungaamal types for feminine k and g: the Ali Gali look-alikes. */
const K = 'ᢈ';
const G = 'ᢉ';

describe('tungaamalToUnicode', () => {
  it('maps the feminine k and g to the standard QA and GA', () => {
    expect(tungaamalToUnicode(`${G}ᠡᠷ`)).toBe('ᠭᠡᠷ');
    expect(tungaamalToUnicode(`${K}ᠡᠯᠡ`)).toBe('ᠬᠡᠯᠡ');
  });

  it('leaves the masculine letters, which are already standard', () => {
    expect(tungaamalToUnicode('ᠭᠠᠷ')).toBe('ᠭᠠᠷ');
    expect(tungaamalToUnicode('ᠬᠠᠷᠠ')).toBe('ᠬᠠᠷᠠ');
  });

  it('moves the suffix connector from NNBSP to MVS', () => {
    expect(tungaamalToUnicode(`${G}ᠡᠷ${NNBSP}ᠲᠦ`)).toBe(`ᠭᠡᠷ${MVS}ᠲᠦ`);
  });

  it('drops a stray FVS from a suffix head', () => {
    expect(tungaamalToUnicode(`ᠭᠠᠷ${NNBSP}ᠤ${FVS1}ᠨ`)).toBe(`ᠭᠠᠷ${MVS}ᠤᠨ`);
  });

  // The reason this is a function: the particle is only recognised once its
  // own letter has been corrected, so a single lint pass joins it with MVS.
  it('gives a particle spelled with the look-alike a space, not a connector', () => {
    const text = `${G}ᠡᠷ${NNBSP}ᠦ${G}ᠡᠢ`;
    expect(applyFixes(text, lint(text))).toBe(`ᠭᠡᠷ${MVS}ᠦᠭᠡᠢ`);
    expect(tungaamalToUnicode(text)).toBe('ᠭᠡᠷ ᠦᠭᠡᠢ');
  });

  it('is idempotent, and leaves standard text alone', () => {
    const text = `${K}ᠦᠮᠦᠨ${NNBSP}ᠦ${FVS1} ${G}ᠡᠷ${NNBSP}ᠦ${G}ᠡᠢ${NNBSP}ᠦᠦ`;
    const once = tungaamalToUnicode(text);
    expect(tungaamalToUnicode(once)).toBe(once);
    expect(lint(once).filter((d) => d.fix !== undefined)).toEqual([]);
  });

  it('leaves punctuation to the linter, even beside a look-alike', () => {
    const text = `\u4F60\u597D\u3001\u4E16\u754C\u3002 ${G}ᠡᠷ`;
    expect(tungaamalToUnicode(text)).toBe(`\u4F60\u597D\u3001\u4E16\u754C\u3002 ᠭᠡᠷ`);
  });

  // Owner's ruling, 2026-10-25: Tungaamal's y + i is the double-tooth i, and
  // its y + FVS1 + i a real y.
  describe('the y before i', () => {
    it('reads y + i after a vowel as the double-tooth i', () => {
      expect(tungaamalToUnicode('ᠰᠠᠶᠢᠨ')).toBe('ᠰᠠᠢᠨ');
      expect(tungaamalToUnicode(`ᠪᠠᠶᠢᠨ${MVS}ᠠ`)).toBe(`ᠪᠠᠢᠨ${MVS}ᠠ`);
      expect(tungaamalToUnicode('ᠣᠶᠢᠯᠠᠭᠠᠬᠤ')).toBe('ᠣᠢᠯᠠᠭᠠᠬᠤ');
    });

    it('reads y + FVS1 + i as a real y, dropping only the FVS1', () => {
      expect(tungaamalToUnicode(`ᠬᠠᠶ${FVS1}ᠢᠭ`)).toBe('ᠬᠠᠶᠢᠭ');
      expect(tungaamalToUnicode(`ᠮᠠᠶ${FVS1}ᠢᠭ`)).toBe('ᠮᠠᠶᠢᠭ');
    });

    it('never chains the two: y + FVS1 + i does not end as a plain i', () => {
      expect(tungaamalToUnicode(`ᠮᠠᠶ${FVS1}ᠢᠭ ᠰᠠᠶᠢᠨ`)).toBe('ᠮᠠᠶᠢᠭ ᠰᠠᠢᠨ');
    });

    it('writes чамайг and намайг with FVS1, plain or not', () => {
      expect(tungaamalToUnicode('ᠴᠢᠮᠠᠶᠢ')).toBe(`ᠴᠢᠮᠠᠶ${FVS1}ᠢ`);
      expect(tungaamalToUnicode(`ᠴᠢᠮᠠᠶ${FVS1}ᠢ`)).toBe(`ᠴᠢᠮᠠᠶ${FVS1}ᠢ`);
      expect(tungaamalToUnicode('ᠨᠠᠮᠠᠶᠢ᠃')).toBe(`ᠨᠠᠮᠠᠶ${FVS1}ᠢ᠃`);
      expect(tungaamalToUnicode(`ᠴᠢᠮᠠᠶᠢ${NNBSP}ᠪᠠᠨ`)).toBe(`ᠴᠢᠮᠠᠶ${FVS1}ᠢ${MVS}ᠪᠠᠨ`);
    });

    it('leaves the suffixes ᠶᠢ and ᠶᠢᠨ after a connector, and y + i after no vowel', () => {
      expect(tungaamalToUnicode(`ᠬᠣᠲᠠ${NNBSP}ᠶᠢᠨ`)).toBe(`ᠬᠣᠲᠠ${MVS}ᠶᠢᠨ`);
      expect(tungaamalToUnicode(`ᠨᠣᠮ${NNBSP}ᠢ ᠶᠢᠨ`)).toBe(`ᠨᠣᠮ${MVS}ᠢ ᠶᠢᠨ`);
    });
  });

  it('does not touch what is not Mongolian', () => {
    expect(tungaamalToUnicode('Tungaamal 12\u202F345 😀')).toBe('Tungaamal 12\u202F345 😀');
  });
});

describe('isTungaamal', () => {
  it('is true for either look-alike in otherwise Hudum text', () => {
    expect(isTungaamal(`${G}ᠡᠷ`)).toBe(true);
    expect(isTungaamal(`ᠮᠣᠩᠭᠤᠯ ${K}ᠡᠯᠡ`)).toBe(true);
  });

  it('is false without one — standard text, legacy NNBSP text, no bichig at all', () => {
    expect(isTungaamal('ᠭᠡᠷ')).toBe(false);
    expect(isTungaamal(`ᠭᠠᠷ${NNBSP}ᠤᠨ`)).toBe(false);
    expect(isTungaamal('Tungaamal')).toBe(false);
    expect(isTungaamal('')).toBe(false);
  });

  // U+1889 KA beside U+1891 GHA, U+1880 anusvara: a real Ali Gali passage.
  it('is false when any other Ali Gali letter is present, on either side', () => {
    expect(isTungaamal(`${G}ᠠ\u1891ᠠ`)).toBe(false);
    expect(isTungaamal(`\u1880 ${G}ᠡᠷ`)).toBe(false);
  });
});
