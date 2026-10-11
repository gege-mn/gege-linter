import { describe, expect, it, vi } from 'vitest';
import { applyFixes, lint, suffixes, unknownSuffix } from '../src/index.js';

const { dag, deg } = vi.hoisted(() => ({ dag: '\u1833\u1820\u182d', deg: '\u1833\u1821\u182d' }));

// The dictionary as it will be once -даг/-дэг are removed upstream.
vi.mock('../src/data/suffixes.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/data/suffixes.js')>();
  return {
    ...actual,
    suffixes: actual.suffixes.filter((s) => s.sequence !== dag && s.sequence !== deg),
  };
});

const MVS = '\u180e';
const NNBSP = '\u202f';
const yabu = '\u1836\u1820\u182a\u1824';

describe('detached-suffix, with the ending gone from the dictionary', () => {
  it('runs against a dictionary that no longer lists it', () => {
    expect(suffixes.some((s) => s.sequence === dag || s.sequence === deg)).toBe(false);
    // unknown-suffix reads that dictionary: an unlisted run is still reported.
    expect(lint(`${yabu}${MVS}\u1833\u1820\u182d\u182d`, [unknownSuffix])).toHaveLength(1);
  });

  for (const conn of [MVS, NNBSP]) {
    for (const ending of [dag, deg]) {
      it(`reports ${ending === dag ? 'dag' : 'deg'} after ${conn === MVS ? 'MVS' : 'NNBSP'} once, not as an unknown suffix too`, () => {
        const text = `${yabu}${conn}${ending}`;
        expect(lint(text, [unknownSuffix])).toHaveLength(0);
        const found = lint(text);
        expect(found.map((d) => d.rule)).toEqual(['detached-suffix']);
        expect(applyFixes(text, found)).toBe(`${yabu}${ending}`);
      });
    }
  }
});
