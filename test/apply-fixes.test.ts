import { describe, expect, it } from 'vitest';
import { applyFixes, lint } from '../src/index.js';

const NNBSP = '\u202F';
const MVS = '\u180E';

describe('applyFixes', () => {
  it('splices in code-point space — safe with astral chars before the fix', () => {
    const text = `😀😀ᠠ${NNBSP}ᠠ`;
    expect(applyFixes(text, lint(text))).toBe(`😀😀ᠠ${MVS}ᠠ`);
  });

  it('applies multiple fixes back-to-front', () => {
    const text = `ᠠ${NNBSP}ᠠ ᢈ`;
    expect(applyFixes(text, lint(text))).toBe(`ᠠ${MVS}ᠠ ᠬ`);
  });

  it('ignores diagnostics without a fix', () => {
    expect(applyFixes('ᠮᠣᠩᠭᠣᠯ', lint('ᠮᠣᠩᠭᠣᠯ'))).toBe('ᠮᠣᠩᠭᠣᠯ');
  });
});
