import { describe, expect, it } from 'vitest';
import { lint, nonInitialO } from '../src/index.js';

describe('non-initial-o', () => {
  it('accepts O as the first vowel, even when not the first letter', () => {
    expect(lint('ᠬᠣᠲᠠ', [nonInitialO])).toHaveLength(0);
  });

  it('hints at O past the first syllable, at info severity', () => {
    // ᠮᠣᠩᠭᠣᠯ is a real hit, not an exception: ᠮᠣᠩᠭᠤᠯ is the correct spelling.
    // Severity stays info because loanwords and ᠭᠣᠣᠯ legitimately trip it.
    expect(lint('ᠮᠣᠩᠭᠣᠯ', [nonInitialO])).toMatchObject([{ start: 4, severity: 'info' }]);
    expect(lint('ᠣᠷᠣᠨ', [nonInitialO])).toMatchObject([{ start: 2 }]);
  });

  it('does not fire on the corrected spelling', () => {
    expect(lint('ᠮᠣᠩᠭᠤᠯ', [nonInitialO])).toHaveLength(0);
  });

  it('resets at word boundaries', () => {
    expect(lint('ᠬᠣᠲᠠ ᠬᠣᠲᠠ', [nonInitialO])).toHaveLength(0);
  });

  it('treats a suffix joined by MVS as part of the word', () => {
    expect(lint('ᠭᠠᠵᠠᠷ\u180Eᠣᠨ', [nonInitialO])).toHaveLength(1);
  });
});
