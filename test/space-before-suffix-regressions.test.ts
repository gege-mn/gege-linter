import { describe, expect, it } from 'vitest';
import { spaceParticles } from '../src/data/suffixes.js';
import { applyFixes, lint, rules, spaceBeforeSuffix, suffixes } from '../src/index.js';
import { gegePixel } from './fixtures/real-text.js';

const MVS = String.fromCodePoint(0x180e);
const FVS1 = String.fromCodePoint(0x180b);
const only = (text: string) => lint(text, [spaceBeforeSuffix]);
const stem = 'ᠨᠣᠮ';

const WORDS_TOO = [
  'yin',
  'ü',
  'dur',
  'dür',
  'tur',
  'tür',
  'acha',
  'bar',
  'ber',
  'tai',
  'ban',
  'nar',
  'degen',
  'tuni',
  'duγar',
  'düger',
  'daγan',
];
const ALWAYS_JOINED = ['chu', 'chü'];
const standsAlone = (s: { category: string; translit: string }) =>
  (s.category === 'particle' || s.category === 'possession') && !ALWAYS_JOINED.includes(s.translit);

const reported = suffixes.filter((s) => !standsAlone(s));
const certain = reported.filter((s) => !WORDS_TOO.includes(s.translit));
const hints = reported.filter((s) => WORDS_TOO.includes(s.translit));
const name = (s: { translit: string }) => s.translit;

describe('every suffix in the dictionary', () => {
  it('has the split this file pins', () => {
    expect(hints.map(name).sort()).toEqual([...WORDS_TOO].sort());
    expect(certain.length).toBeGreaterThan(30);
  });

  it.each(certain.map((s) => [name(s), s] as const))(
    '%s warns, and its fix lints clean',
    (_, s) => {
      const text = `${stem} ${s.sequence}`;
      const [d, ...rest] = only(text);
      expect(rest).toEqual([]);
      expect(d?.severity).toBe('warning');
      const fixed = applyFixes(text, only(text));
      expect(fixed).toBe(`${stem}${MVS}${s.sequence}`);
      expect(lint(fixed).filter((x) => x.severity !== 'info')).toEqual([]);
    },
  );

  it.each(hints.map((s) => [name(s), s] as const))(
    '%s only hints, with no fix to glue a word',
    (_, s) => {
      const [d, ...rest] = only(`${stem} ${s.sequence}`);
      expect(rest).toEqual([]);
      expect(d?.severity).toBe('info');
      expect(d?.fix).toBeUndefined();
    },
  );

  it.each(certain.map((s) => [name(s), s] as const))(
    '%s written with FVS1 is fixed to the plain spelling',
    (_, s) => {
      const letters = [...s.sequence];
      const withFvs = [letters[0], FVS1, ...letters.slice(1)].join('');
      const text = `${stem} ${withFvs}`;
      expect(applyFixes(text, only(text))).toBe(`${stem}${MVS}${s.sequence}`);
    },
  );

  it.each(reported.flatMap((s) => ['ᠠ', 'ᠡ'].map((v) => [`${name(s)} + ${v}`, s, v] as const)))(
    '%s, a separated final vowel, is a word and stays silent',
    (_, s, vowel) => {
      expect(only(`${stem} ${s.sequence}${MVS}${vowel}`)).toEqual([]);
    },
  );

  it.each(reported.map((s) => [name(s), s] as const))(
    '%s inside a longer word stays silent',
    (_, s) => {
      expect(only(`${stem} ${s.sequence}ᠯᠠᠭ`)).toEqual([]);
    },
  );

  it.each(reported.map((s) => [name(s), s] as const))('%s already joined stays silent', (_, s) => {
    expect(only(`${stem}${MVS}${s.sequence}`)).toEqual([]);
  });
});

describe('words that take a space', () => {
  it.each(spaceParticles.map((s) => [name(s), s] as const))('%s stays silent', (_, s) => {
    expect(only(`${stem} ${s.sequence}`)).toEqual([]);
  });

  it.each(suffixes.filter(standsAlone).map((s) => [name(s), s] as const))(
    '%s stays silent',
    (_, s) => {
      expect(only(`${stem} ${s.sequence}`)).toEqual([]);
    },
  );
});

describe('ᠴᠤ / ᠴᠦ', () => {
  it.each([
    ['ᠴᠤ', 'ᠪᠢ'],
    ['ᠴᠦ', 'ᠨᠡᠷ'],
  ])('%s warns after a plain space', (particle, word) => {
    const text = `${word} ${particle}`;
    expect(only(text)[0]?.severity).toBe('warning');
    expect(applyFixes(text, only(text))).toBe(`${word}${MVS}${particle}`);
  });

  it('leaves a word that starts with them alone', () => {
    expect(only(`${stem} ᠴᠤᠳᠠ`)).toEqual([]);
  });
});

describe('real words that once got glued', () => {
  it.each([
    ['ᠮᠢᠨᠦ', `ᠨᠡᠷ${MVS}ᠡ`],
    ['ᠨᠣᠮ', `ᠦᠨ${MVS}ᠡ`],
    ['ᠡᠳᠦᠷ', `ᠦᠳ${MVS}ᠡ`],
    ['ᠨᠢᠭᠡ', `ᠤᠳ${MVS}ᠠ`],
    ['ᠲᠡᠩᠭᠡᠷ', `ᠨᠠᠷ${MVS}ᠠ`],
  ])('%s %s stays two words', (first, second) => {
    const text = `${first} ${second}`;
    expect(only(text)).toEqual([]);
    expect(applyFixes(text, lint(text))).toContain(' ');
  });
});

const INVISIBLE = new Set(
  [0x180b, 0x180c, 0x180d, 0x180e, 0x202f].map((c) => String.fromCodePoint(c)),
);
const strip = (t: string) => [...t].filter((c) => c.trim() && !INVISIBLE.has(c)).join('');

describe.each(gegePixel.map((t, i) => [i, t] as const))('real text, paragraph %i', (_, text) => {
  it("keeps its letters through this rule's fixes", () => {
    expect(strip(applyFixes(text, only(text)))).toBe(strip(text));
  });

  it('ends with no fix left and nothing new', () => {
    const before = new Set(lint(text, rules).map((d) => d.code));
    let fixed = text;
    for (let i = 0; i < 3; i++) fixed = applyFixes(fixed, lint(fixed));
    expect(lint(fixed).filter((d) => d.fix !== undefined)).toEqual([]);
    expect(lint(fixed).filter((d) => d.severity !== 'info' && !before.has(d.code))).toEqual([]);
  });
});

it('the Pixel post reports what a person found in it', () => {
  const found = gegePixel.flatMap(only);
  expect(found.filter((d) => d.severity === 'warning')).toHaveLength(10);
  expect(found.filter((d) => d.severity === 'info')).toHaveLength(2);
});
