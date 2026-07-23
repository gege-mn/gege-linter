import { describe, expect, it } from 'vitest';
import { lint, mvsContext } from '../src/index.js';

const MVS = '\u180E';

describe('mvs-context', () => {
  it('accepts MVS between two Mongolian letters', () => {
    expect(lint(`ᠰᠢᠨ${MVS}ᠡ`, [mvsContext])).toHaveLength(0);
  });

  it('flags MVS at the start or end of a word', () => {
    expect(lint(`${MVS}ᠠ`, [mvsContext])).toMatchObject([{ start: 0, severity: 'error' }]);
    expect(lint(`ᠰᠢᠨ${MVS}`, [mvsContext])).toMatchObject([{ start: 3 }]);
  });

  it('flags MVS beside a space and doubled MVS', () => {
    expect(lint(`ᠠ${MVS} ᠡ`, [mvsContext])).toHaveLength(1);
    expect(lint(`ᠠ${MVS}${MVS}ᠡ`, [mvsContext])).toHaveLength(2);
  });

  it('looks through FVS on the left and accepts digits', () => {
    expect(lint(`ᠳ\u180B${MVS}ᠤᠨ`, [mvsContext])).toHaveLength(0);
    expect(lint(`᠑${MVS}ᠳᠦᠭᠡᠷ`, [mvsContext])).toHaveLength(0);
  });
});
