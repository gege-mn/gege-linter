import { describe, expect, it } from 'vitest';
import { lint, suffixes, unknownSuffix } from '../src/index.js';

const MVS = '\u180e';
const NNBSP = '\u202f';

// ᠨᠣᠮ (nom, "book") — a consonant-final stem.
const stem = 'ᠨᠣᠮ';

describe('unknown-suffix', () => {
  it('accepts every dictionary entry after MVS', () => {
    for (const s of suffixes) {
      expect(lint(`${stem}${MVS}${s.sequence}`, [unknownSuffix]), s.translit).toHaveLength(0);
    }
  });

  it('flags an unknown letter run, spanning just the run', () => {
    // ᠤᠰ is not a suffix (ᠰ where genitive ᠤᠨ has ᠨ).
    const [d, ...rest] = lint(`${stem}${MVS}ᠤᠰ`);
    expect(rest).toHaveLength(0);
    expect(d?.rule).toBe('unknown-suffix');
    expect(d?.severity).toBe('warning');
    expect(d?.start).toBe(4);
    expect(d?.end).toBe(6);
    expect(d?.fix).toBeUndefined();
  });

  it('rejects a dictionary prefix when letters continue past it', () => {
    // ᠤᠨ + ᠠ: the run is ᠤᠨᠠ, which is not an entry — ᠤᠨ must not match.
    expect(lint(`${stem}${MVS}ᠤᠨᠠ`, [unknownSuffix])).toMatchObject([{ start: 4, end: 7 }]);
  });

  it('validates the run after a legacy NNBSP connector too', () => {
    expect(lint(`${stem}${NNBSP}ᠤᠨ`, [unknownSuffix])).toHaveLength(0);
    expect(lint(`${stem}${NNBSP}ᠤᠰ`, [unknownSuffix])).toMatchObject([
      { rule: 'unknown-suffix', start: 4, end: 6 },
    ]);
  });

  it('accepts the separated final a/e (ᠬᠠᠷ\u180eᠠ, ᠳᠡᠭᠡᠷ\u180eᠡ)', () => {
    expect(lint(`ᠬᠠᠷ${MVS}ᠠ`)).toHaveLength(0);
    expect(lint(`ᠳᠡᠭᠡᠷ${MVS}ᠡ`)).toHaveLength(0);
  });

  it('handles the internal MVS of ᠯᠤᠭ\u180eᠠ as part of one entry', () => {
    expect(lint(`${stem}${MVS}ᠯᠤᠭ${MVS}ᠠ`)).toHaveLength(0);
  });

  it('validates stacked suffixes independently (ᠲᠠᠢ + ᠪᠠᠨ)', () => {
    expect(lint(`${stem}${MVS}ᠲᠠᠢ${MVS}ᠪᠠᠨ`)).toHaveLength(0);
  });

  it('accepts the possessive clitics found by corpus-linting gege.mn', () => {
    expect(lint(`ᠨᠢᠭᠡ${MVS}ᠨᠢ`, [unknownSuffix])).toHaveLength(0);
    expect(lint(`ᠳᠠᠷᠠᠭ${MVS}ᠠ${MVS}ᠨᠢ`, [unknownSuffix])).toHaveLength(0);
  });

  it('stays silent where mvs-context owns the problem', () => {
    expect(lint(`${stem}${MVS}`, [unknownSuffix])).toHaveLength(0);
    expect(lint(`a${MVS}ᠤᠨ`, [unknownSuffix])).toHaveLength(0);
  });

  it('accepts ordinal suffixes after digits (᠑\u180eᠳᠦᠭᠡᠷ)', () => {
    expect(lint(`᠑${MVS}ᠳᠦᠭᠡᠷ`, [unknownSuffix])).toHaveLength(0);
    expect(lint(`᠑${MVS}ᠳᠦᠭᠡ`, [unknownSuffix])).toHaveLength(1);
  });

  it('offers a strip fix when only a stray FVS breaks the match', () => {
    // ᠤ + FVS1 + ᠳ (found in gege.mn) is the plural ᠤᠳ with a redundant FVS.
    const [d, ...rest] = lint(`${stem}${MVS}ᠤ\u180bᠳ`, [unknownSuffix]);
    expect(rest).toHaveLength(0);
    expect(d).toMatchObject({ start: 4, end: 7, fix: 'ᠤᠳ' });
    expect(d?.message).toContain('stray FVS');
  });

  it('offers no fix when the run is unknown even without its FVS', () => {
    const [d] = lint(`${stem}${MVS}ᠤ\u180bᠰ`, [unknownSuffix]);
    expect(d).toMatchObject({ start: 4, end: 7 });
    expect(d?.fix).toBeUndefined();
  });
});
