import { describe, expect, it } from 'vitest';
import { applyFixes, formalRules, lint, rules, spaceBeforeSuffix } from '../src/index.js';

const MVS = '\u180e';
const only = (text: string) => lint(text, [spaceBeforeSuffix]);

const bichig = 'ᠪᠢᠴᠢᠭ';
const nom = 'ᠨᠣᠮ';
const tei = 'ᠲᠡᠢ';
const tai = 'ᠲᠠᠢ';
const nugud = 'ᠨᠤᠭᠤᠳ';
const bar = 'ᠪᠠᠷ';

describe('space-before-suffix', () => {
  it('warns on a suffix after a plain space and fixes it to MVS', () => {
    const text = `${bichig} ${tei}`;
    const [d] = only(text);
    expect(d).toMatchObject({
      severity: 'warning',
      code: 'GL1301',
      start: bichig.length,
      end: bichig.length + 1 + tei.length,
    });
    expect(applyFixes(text, only(text))).toBe(`${bichig}${MVS}${tei}`);
  });

  it('covers plurals', () => {
    expect(only(`${nom} ${nugud}`)).toHaveLength(1);
  });

  it.each([
    ['tai', tai],
    ['bar', bar],
  ])('only hints at %s, which is also a word, and offers no fix', (_, suffix) => {
    const [d] = only(`${nom} ${suffix}`);
    expect(d).toMatchObject({ severity: 'info', code: 'GL1302' });
    expect(d?.fix).toBeUndefined();
  });

  it.each([
    ['the question particle ᠤᠤ', 'ᠤᠤ'],
    ['ᠦᠭᠡᠢ', 'ᠦᠭᠡᠢ'],
    ['the particle ᠨᠢ', 'ᠨᠢ'],
    ['a vocative ᠠ', 'ᠠ'],
    ['an ordinary word', nom],
    ['a longer word that starts like a suffix', `${tei}ᠨ`],
  ])('leaves %s alone', (_, word) => {
    expect(only(`${nom} ${word}`)).toEqual([]);
  });

  it.each([
    ['ᠨᠡᠷ', 'ᠡ'],
    ['ᠦᠨ', 'ᠡ'],
    ['ᠤᠳ', 'ᠠ'],
    ['ᠨᠠᠷ', 'ᠠ'],
  ])('leaves %s with a separated final %s alone: it is a word', (stem, vowel) => {
    expect(only(`${nom} ${stem}${MVS}${vowel}`)).toEqual([]);
  });

  it('still reports a suffix stacked on by a connector', () => {
    expect(only(`${nom} ${tei}${MVS}ᠪᠡᠨ`)).toHaveLength(1);
  });

  it('matches through an FVS inside the suffix', () => {
    expect(only(`${nom} ${'\u1824\u180b\u1828'}`)).toHaveLength(1);
  });

  it('drops the FVS when it fixes', () => {
    const fvs = String.fromCodePoint(0x180b);
    const text = `${nom} ᠤ${fvs}ᠨ`;
    const fixed = applyFixes(text, only(text));
    expect(fixed).toBe(`${nom}${MVS}ᠤᠨ`);
    expect(lint(fixed)).toEqual([]);
  });

  it('leaves connector-joined suffixes alone', () => {
    expect(only(`${bichig}${MVS}${tei}`)).toEqual([]);
  });

  it('needs a Mongolian word before the space', () => {
    expect(only(`UTN ${tei}`)).toEqual([]);
    expect(only(`᠒᠐ ${tei}`)).toEqual([]);
    expect(only(tei)).toEqual([]);
  });

  it('accepts punctuation after the suffix', () => {
    expect(only(`${bichig} ${tei}᠂`)).toHaveLength(1);
  });

  it('runs in both rule sets', () => {
    expect(rules).toContain(spaceBeforeSuffix);
    expect(formalRules).toContain(spaceBeforeSuffix);
  });

  it('lands clean in default mode after the fix', () => {
    const text = `${bichig} ${tei}`;
    expect(lint(applyFixes(text, lint(text)))).toEqual([]);
  });
});
