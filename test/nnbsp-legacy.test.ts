import { describe, expect, it } from 'vitest';
import { lint, nnbspLegacy } from '../src/index.js';

const NNBSP = '\u202f';
const MVS = '\u180e';

// ᠪᠢᠳᠡᠨ (stem) + genitive ᠤ — a real pair from gege.mn's landing page.
const stem = 'ᠪᠢᠳᠡᠨ';
const genitive = 'ᠤ';

describe('nnbsp-legacy', () => {
  it('flags an NNBSP suffix connector and offers the MVS fix', () => {
    const [d, ...rest] = lint(`${stem}${NNBSP}${genitive}`);
    expect(rest).toHaveLength(0);
    expect(d?.rule).toBe('nnbsp-legacy');
    expect(d?.severity).toBe('warning');
    expect(d?.start).toBe(5);
    expect(d?.end).toBe(6);
    expect(d?.fix).toBe(MVS);
  });

  it('accepts the MVS connector', () => {
    expect(lint(`${stem}${MVS}${genitive}`)).toHaveLength(0);
  });

  it('ignores NNBSP outside Mongolian text (e.g. digit grouping)', () => {
    expect(lint(`12${NNBSP}345`)).toHaveLength(0);
  });

  it('still flags NNBSP after an FVS-modified stem-final letter or a digit', () => {
    expect(lint(`ᠳ\u180B${NNBSP}ᠤᠨ`, [nnbspLegacy])).toMatchObject([{ start: 2, fix: MVS }]);
    expect(lint(`᠑${NNBSP}ᠳᠦᠭᠡᠷ`, [nnbspLegacy])).toHaveLength(1);
  });
});

describe('nnbsp-legacy before space-joined particles', () => {
  // ᠤᠤ/ᠦᠦ/ᠪᠦᠦ/ᠦᠭᠡᠢ are separate words: the correction is a space, not MVS.
  // Swapping in MVS would trade a legacy bug for a current one.
  it('fixes NNBSP before ᠦᠦ to a plain space', () => {
    expect(lint('ᠦᠭᠡᠢ\u202Fᠦᠦ', [nnbspLegacy])).toMatchObject([{ fix: ' ' }]);
  });

  it('fixes NNBSP before ᠤᠤ to a plain space', () => {
    expect(lint('ᠰᠠᠶᠢᠨ\u202Fᠤᠤ', [nnbspLegacy])).toMatchObject([{ fix: ' ' }]);
  });

  it('still fixes an ordinary suffix connector to MVS', () => {
    expect(lint('ᠭᠠᠵᠠᠷ\u202Fᠤᠨ', [nnbspLegacy])).toMatchObject([{ fix: '\u180E' }]);
  });

  it('does not treat a particle-lookalike prefix as a particle', () => {
    // ᠤᠤᠯ continues past ᠤᠤ, so this is a suffix, not the question particle.
    expect(lint('ᠭᠠᠵᠠᠷ\u202Fᠤᠤᠯ', [nnbspLegacy])).toMatchObject([{ fix: '\u180E' }]);
  });
});
