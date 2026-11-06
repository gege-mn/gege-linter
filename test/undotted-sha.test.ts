import { describe, expect, it } from 'vitest';
import { applyFixes, lint, rules, undottedSha } from '../src/index.js';

const SHA = '\u1831';
const I = '\u1822';
const FVS1 = '\u180B';
const FVS2 = '\u180C';
const MVS = '\u180E';

const check = (text: string) => lint(text, [undottedSha]);

// Ruled 2026-11-07: SHA before I takes FVS2, or the font draws it as SA.
describe('undotted-sha', () => {
  // The dictionary spellings, bare SHA I in both.
  const jishee = `\u1835${I}${SHA}${I}\u1836${MVS}\u1821`;
  const jishig = `\u1835${I}${SHA}${I}\u182D`;

  it('reports SHA directly before I, on the SHA', () => {
    const [d, ...rest] = check(jishee);
    expect(rest).toEqual([]);
    expect(d).toMatchObject({ rule: 'undotted-sha', code: 'GL1601', severity: 'warning' });
    expect(d?.start).toBe(2);
    expect(d?.end).toBe(3);
  });

  it('fixes it by inserting FVS2', () => {
    expect(applyFixes(jishee, check(jishee))).toBe(`\u1835${I}${SHA}${FVS2}${I}\u1836${MVS}\u1821`);
    expect(applyFixes(jishig, check(jishig))).toBe(`\u1835${I}${SHA}${FVS2}${I}\u182D`);
  });

  it('finds the pair word-initially too', () => {
    expect(check(`${SHA}${I}\u1828`)).toHaveLength(1);
  });

  it('leaves FVS2, a deliberate FVS1 and SHA before other letters alone', () => {
    expect(check(`\u1835${I}${SHA}${FVS2}${I}\u182D`)).toEqual([]);
    expect(check(`\u1835${I}${SHA}${FVS1}${I}\u182D`)).toEqual([]);
    expect(check(`\u182A\u1820${SHA}\u1820`)).toEqual([]);
    // шинэ is spelled with SA, which has no dots to lose.
    expect(check(`\u1830${I}\u1828${MVS}\u1821`)).toEqual([]);
  });

  it('runs by default, and the full fix pass leaves nothing for it', () => {
    expect(rules).toContain(undottedSha);
    const fixed = applyFixes(jishee, lint(jishee));
    expect(lint(fixed).filter((d) => d.rule === 'undotted-sha')).toEqual([]);
    expect(lint(fixed).filter((d) => d.rule === 'fvs-unregistered')).toEqual([]);
  });
});
