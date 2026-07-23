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
