import { describe, expect, it } from 'vitest';
import { applyFixes, lint, noPua } from '../src/index.js';

describe('no-pua', () => {
  it('flags a lone PUA code point', () => {
    expect(lint('\uE264', [noPua])).toMatchObject([{ start: 0, end: 1, severity: 'error' }]);
  });

  it('groups a contiguous PUA run into one diagnostic', () => {
    const ds = lint('ᠠ\uE264\uE265\uE266ᠠ', [noPua]);
    expect(ds).toMatchObject([{ start: 1, end: 4 }]);
    expect(ds[0]?.message).toContain('3');
  });

  it('offers the Unicode reading of a Menksoft run', () => {
    const text = 'a \uE2C1\uE27F\uE317\uE27E\uE2E8 b';
    expect(applyFixes(text, lint(text, [noPua]))).toBe('a ᠪᠢᠴᠢᠭ b');
  });

  it('offers no fix for a PUA run outside the Menksoft band', () => {
    expect(lint('\uE000\uE2C1', [noPua])[0]?.fix).toBeUndefined();
    expect(lint('\uF8FF', [noPua])[0]?.fix).toBeUndefined();
  });

  it('accepts clean Unicode Mongolian', () => {
    expect(lint('ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ', [noPua])).toHaveLength(0);
  });
});
