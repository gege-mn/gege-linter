import { describe, expect, it } from 'vitest';
import { lint, zwjZwnj } from '../src/index.js';

const ZWNJ = '\u200C';
const ZWJ = '\u200D';

describe('zwj-zwnj', () => {
  it('flags a joiner between two Mongolian letters', () => {
    expect(lint(`ᠠ${ZWJ}ᠯ`, [zwjZwnj])).toMatchObject([{ start: 1, severity: 'warning' }]);
    expect(lint(`ᠠ${ZWNJ}ᠯ`, [zwjZwnj])).toHaveLength(1);
  });

  it('leaves emoji ZWJ sequences alone', () => {
    expect(lint(`👨${ZWJ}👩`, [zwjZwnj])).toHaveLength(0);
  });

  it('allows the positional forms the core spec documents (16.0 §13.5)', () => {
    // <1820 200D> initial, <200D 1820> final, <200D 1820 200D> medial — a
    // letter in isolation, which is a sanctioned use, not an error.
    expect(lint(`ᠠ${ZWJ}`, [zwjZwnj])).toHaveLength(0);
    expect(lint(`${ZWJ}ᠠ`, [zwjZwnj])).toHaveLength(0);
    expect(lint(`${ZWJ}ᠠ${ZWJ}`, [zwjZwnj])).toHaveLength(0);
  });

  it('gives ZWNJ no boundary pass — at an edge it selects nothing', () => {
    // The spec sentence names both characters, but the tabulated sequences,
    // the abbreviation pattern and all 85 corpus hits are ZWJ's. A letter at a
    // word edge is already non-joining there, so a boundary ZWNJ is redundant.
    expect(lint(`${ZWNJ}ᠡ`, [zwjZwnj])).toHaveLength(1);
    expect(lint(`ᠠᠪ${ZWNJ}`, [zwjZwnj])).toHaveLength(1);
    expect(lint(`ᠠᠪ${ZWNJ}᠂`, [zwjZwnj])).toHaveLength(1);
  });

  it('allows the abbreviation pattern — letter + ZWJ before a Mongolian comma', () => {
    // ЗХУ. All 85 joiners in the harvest corpus are this shape.
    expect(lint(`ᠵᠢ${ZWJ}᠂ᠬᠤ${ZWJ}᠂ᠤ${ZWJ}`, [zwjZwnj])).toHaveLength(0);
  });
});
