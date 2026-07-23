import { describe, expect, it } from 'vitest';
import { lint, noPua } from '../src/index.js';

describe('no-pua', () => {
  it('flags a lone PUA code point', () => {
    expect(lint('\uE264', [noPua])).toMatchObject([{ start: 0, end: 1, severity: 'error' }]);
  });

  it('groups a contiguous PUA run into one diagnostic', () => {
    const ds = lint('ᠠ\uE264\uE265\uE266ᠠ', [noPua]);
    expect(ds).toMatchObject([{ start: 1, end: 4 }]);
    expect(ds[0]?.message).toContain('3');
  });

  it('accepts clean Unicode Mongolian', () => {
    expect(lint('ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ', [noPua])).toHaveLength(0);
  });
});
