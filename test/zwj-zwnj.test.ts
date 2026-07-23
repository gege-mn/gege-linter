import { describe, expect, it } from 'vitest';
import { lint, zwjZwnj } from '../src/index.js';

const ZWNJ = '\u200C';
const ZWJ = '\u200D';

describe('zwj-zwnj', () => {
  it('flags ZWJ/ZWNJ touching a Mongolian letter', () => {
    expect(lint(`ᠠ${ZWJ}ᠯ`, [zwjZwnj])).toMatchObject([{ start: 1, severity: 'warning' }]);
    expect(lint(`${ZWNJ}ᠡ`, [zwjZwnj])).toHaveLength(1);
  });

  it('leaves emoji ZWJ sequences alone', () => {
    expect(lint(`👨${ZWJ}👩`, [zwjZwnj])).toHaveLength(0);
  });
});
