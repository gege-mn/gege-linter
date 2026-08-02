import { describe, expect, it } from 'vitest';
import { applyFixes, compatPunctuation, lint } from '../src/index.js';

describe('compat-punctuation', () => {
  it('flags the vertical question mark and routes it to U+FF1F', () => {
    const ds = lint('ᠤᠤ︖', [compatPunctuation]);
    expect(ds).toMatchObject([{ start: 2, end: 3, severity: 'warning', fix: '？' }]);
    expect(ds[0]?.message).toContain('U+FE16');
    expect(ds[0]?.message).toContain('GB 18030');
  });

  it('prefers the Mongolian comma, full stop and ellipsis over the nominal CJK/ASCII form', () => {
    const fix = (s: string) => lint(s, [compatPunctuation])[0]?.fix;
    expect(fix('︐')).toBe('᠂'); // vertical comma, decomposes to ASCII ','
    expect(fix('︑')).toBe('᠂'); // vertical ideographic comma
    expect(fix('︒')).toBe('᠃'); // vertical ideographic full stop
    expect(fix('︙')).toBe('᠁'); // vertical ellipsis
    expect(fix('﹑')).toBe('᠂'); // small ideographic comma — not U+3001
  });

  it('keeps the sentence-final pair asymmetric: fullwidth ？ but ASCII !', () => {
    // Not an oversight. UTN #57 Table 1 requires the CJK question mark; no
    // source requires a fullwidth exclamation, so 13.5's sanctioned Western
    // punctuation wins there. See the rule's header comment before changing.
    const fix = (s: string) => lint(s, [compatPunctuation])[0]?.fix;
    expect(fix('︖')).toBe('？'); // U+FE16 → U+FF1F
    expect(fix('︕')).toBe('!'); // U+FE15 → U+0021, not U+FF01
    expect(fix('﹗')).toBe('!'); // U+FE57 small exclamation, same target
  });

  it('covers the CJK Compatibility Forms and Small Form Variants blocks too', () => {
    const em = lint('︱', [compatPunctuation]);
    expect(em).toMatchObject([{ severity: 'warning', fix: '—' }]);
    expect(em[0]?.message).toContain('CNS 11643');
    expect(lint('﹨', [compatPunctuation])[0]?.fix).toBe('\\');
    expect(lint('﹟', [compatPunctuation])[0]?.fix).toBe('#');
  });

  it('demotes Chinese-borrowed comma/full stop to info, and only inside Hudum text', () => {
    const ds = lint('ᠮᠣᠩᠭᠣᠯ。', [compatPunctuation]);
    expect(ds).toMatchObject([{ severity: 'info', fix: '᠃' }]);
    expect(ds[0]?.message).toContain('Todo and Sibe');
    // Same code point in Chinese text is correct and must stay silent.
    expect(lint('中文。', [compatPunctuation])).toHaveLength(0);
    expect(lint('中文、｡', [compatPunctuation])).toHaveLength(0);
  });

  it('leaves sanctioned Western punctuation and native Mongolian marks alone', () => {
    // Core spec 13.5: modern Mongolian may use Western punctuation marks.
    expect(lint('ᠮᠣᠩᠭᠣᠯ, ᠤᠤ? (ᠲᠡᠶᠢᠮᠦ!)', [compatPunctuation])).toHaveLength(0);
    expect(lint('ᠮᠣᠩᠭᠣᠯ᠂ ᠤᠤ？᠃᠁᠅', [compatPunctuation])).toHaveLength(0);
  });

  it('fixes cleanly in one pass, leaving no compatibility code point behind', () => {
    const dirty = 'ᠮᠣᠩᠭᠣᠯ︐ ᠪᠢᠴᠢᠭ︖︒︙';
    const clean = applyFixes(dirty, lint(dirty, [compatPunctuation]));
    expect(clean).toBe('ᠮᠣᠩᠭᠣᠯ᠂ ᠪᠢᠴᠢᠭ？᠃᠁');
    expect(lint(clean, [compatPunctuation])).toHaveLength(0);
  });

  it('reports offsets in code points, not UTF-16 units', () => {
    const ds = lint('𐴀︖', [compatPunctuation]); // astral char first
    expect(ds).toMatchObject([{ start: 1, end: 2 }]);
  });
});
