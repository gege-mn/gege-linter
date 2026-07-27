import { describe, expect, it } from 'vitest';
import { doubledAe, lint } from '../src/index.js';

const MVS = '\u180E';

describe('doubled-ae', () => {
  it('flags a doubled ᠠ, naming what it usually is', () => {
    // адмиралаа as the harvest wrote it — the reflexive should be ᠢᠶᠠᠨ.
    const ds = lint('ᠠᠳᠮᠢᠷᠠᠯᠠᠠ', [doubledAe]);
    expect(ds).toHaveLength(1);
    expect(ds[0]?.severity).toBe('warning');
    expect(ds[0]?.start).toBe(7);
    expect(ds[0]?.end).toBe(9);
    expect(ds[0]?.message).toContain('ᠢᠶᠠᠨ');
  });

  it('flags a doubled ᠡ the same way', () => {
    expect(lint('ᠭᠢᠰᠢᠭᠦᠨᠡᠡ', [doubledAe])).toMatchObject([{ severity: 'warning' }]);
  });

  it('never offers a fix — reflexive and vocative want different repairs', () => {
    // ᠢᠶᠠᠨ for the reflexive, a single ᠠ plus a space for the vocative.
    // Guessing between them would corrupt one case to fix the other.
    expect(lint('ᠠᠳᠮᠢᠷᠠᠯᠠᠠ', [doubledAe])[0]?.fix).toBeUndefined();
  });

  it('reports a run of three as one diagnostic', () => {
    const ds = lint('ᠠᠪᠤᠠᠠᠠ', [doubledAe]);
    expect(ds).toHaveLength(1);
    expect(ds[0]?.end).toBe(6);
  });

  it('leaves the doubled o of ᠭᠣᠣᠯ alone — that one marks a short o', () => {
    expect(lint('ᠭᠣᠣᠯ', [doubledAe])).toHaveLength(0);
    expect(lint('ᠳᠣᠣᠷ\u180Eᠠ', [doubledAe])).toHaveLength(0);
  });

  it('leaves the question particles ᠤᠤ / ᠦᠦ alone', () => {
    expect(lint('ᠪᠣᠯᠪᠠ ᠤᠤ', [doubledAe])).toHaveLength(0);
    expect(lint('ᠦᠭᠡᠢ ᠦᠦ', [doubledAe])).toHaveLength(0);
  });

  it('does not fire across a connector, where the pair is two morphemes', () => {
    expect(lint(`ᠨᠡᠷ${MVS}ᠠ`, [doubledAe])).toHaveLength(0);
  });

  it('stays silent on the four words the reader confirmed clean', () => {
    for (const w of ['ᠠᠵᠢᠯᠯᠠ', 'ᠣᠷᠤᠩᠨᠠᠳᠠᠭ', `ᠲᠤᠰᠬᠠᠯ${MVS}ᠠ`, 'ᠪᠤᠲᠠᠷᠠᠯᠲᠠᠢ']) {
      expect(lint(w, [doubledAe]), w).toHaveLength(0);
    }
  });
});
