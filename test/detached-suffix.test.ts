import { describe, expect, it } from 'vitest';
import {
  applyFixes,
  detachedSuffix,
  detachedSuffixFormal,
  formalRules,
  lint,
  rules,
  rulesFor,
} from '../src/index.js';

const MVS = '\u180e';
const NNBSP = '\u202f';
const CONNECTORS = [
  ['MVS', MVS],
  ['NNBSP', NNBSP],
] as const;

// yabu, the stem of явдаг.
const yabu = '\u1836\u1820\u182a\u1824';
// nom, a consonant-final stem of three code points.
const nom = '\u1828\u1823\u182e';
// aq-a (ах): a stem ending in a separated final vowel.
const aqa = `\u1820\u182c${MVS}\u1820`;
const aqaAttached = '\u1820\u182c\u1820';

const dag = '\u1833\u1820\u182d';
const deg = '\u1833\u1821\u182d';
const tai = '\u1832\u1820\u1822';
const ban = '\u182a\u1820\u1828';

const FORMAL = [
  ['tai', tai],
  ['tei', '\u1832\u1821\u1822'],
  ['dugar', '\u1833\u1824\u182d\u1820\u1837'],
  ['duger', '\u1833\u1826\u182d\u1821\u1837'],
  ['daqi', '\u1833\u1820\u182c\u1822'],
  ['deqi', '\u1833\u1821\u182c\u1822'],
] as const;
const ORDINALS = FORMAL.slice(2);

const formal = (text: string) => lint(text, formalRules);

describe('detached-suffix', () => {
  describe('the habitual ending, in every mode', () => {
    for (const [name, conn] of CONNECTORS) {
      for (const ending of [dag, deg]) {
        it(`reports ${ending === dag ? 'dag' : 'deg'} after ${name} as an error, fixed by attaching`, () => {
          const text = `${yabu}${conn}${ending}`;
          for (const active of [rules, formalRules]) {
            const found = lint(text, active);
            expect(found).toHaveLength(1);
            expect(found[0]).toMatchObject({
              rule: 'detached-suffix',
              severity: 'error',
              start: 4,
              end: 5,
              fix: '',
            });
            expect(applyFixes(text, found)).toBe(`${yabu}${ending}`);
          }
        });
      }
    }

    it('is silent on the attached form', () => {
      expect(lint(`${yabu}${dag}`, [detachedSuffix])).toHaveLength(0);
      expect(lint(`${yabu}${deg}`, [detachedSuffixFormal])).toHaveLength(0);
    });

    it('does not match a longer run that only starts with the ending', () => {
      // dag + an: the fused reflexive, a real connector-joined suffix.
      expect(lint(`${nom}${MVS}${dag}\u1820\u1828`, [detachedSuffix])).toHaveLength(0);
    });
  });

  describe('default mode', () => {
    for (const [name, ending] of FORMAL) {
      it(`is silent on connector-joined ${name}`, () => {
        expect(lint(`${nom}${MVS}${ending}`)).toHaveLength(0);
        expect(lint(`${nom}${NNBSP}${ending}`, [detachedSuffix])).toHaveLength(0);
      });
    }

    it('still corrects the legacy connector in front of them', () => {
      const text = `${nom}${NNBSP}${tai}`;
      expect(applyFixes(text, lint(text))).toBe(`${nom}${MVS}${tai}`);
    });
  });

  describe('formal mode', () => {
    for (const [name, ending] of FORMAL) {
      for (const [connName, conn] of CONNECTORS) {
        it(`warns on ${name} after ${connName}, fixed by attaching`, () => {
          const text = `${nom}${conn}${ending}`;
          const found = formal(text);
          expect(found).toHaveLength(1);
          expect(found[0]).toMatchObject({
            rule: 'detached-suffix',
            severity: 'warning',
            start: 3,
            end: 4,
            fix: '',
          });
          expect(applyFixes(text, found)).toBe(`${nom}${ending}`);
        });
      }

      it(`is silent on attached ${name}`, () => {
        expect(lint(`${nom}${ending}`, [detachedSuffixFormal])).toHaveLength(0);
      });
    }

    it('is what rulesFor returns', () => {
      expect(rulesFor('formal')).toBe(formalRules);
      expect(rulesFor('default')).toBe(rules);
      expect(formalRules.map((r) => r.name)).toEqual(rules.map((r) => r.name));
    });
  });

  describe('a stem ending in a separated final vowel', () => {
    for (const [name, conn] of CONNECTORS) {
      it(`drops the vowel's MVS along with the ${name} connector`, () => {
        const text = `${aqa}${conn}${tai}`;
        const found = formal(text);
        expect(found).toHaveLength(1);
        expect(found[0]).toMatchObject({ start: 2, end: 5, fix: '\u1820' });
        expect(applyFixes(text, found)).toBe(`${aqaAttached}${tai}`);
      });
    }

    it('does the same for the always-on ending', () => {
      const text = `${aqa}${MVS}${dag}`;
      const found = lint(text);
      expect(found).toMatchObject([{ severity: 'error', start: 2, end: 5, fix: '\u1820' }]);
      expect(applyFixes(text, found)).toBe(`${aqaAttached}${dag}`);
    });

    it('leaves the stem alone in default mode', () => {
      expect(lint(`${aqa}${MVS}${tai}`)).toHaveLength(0);
    });
  });

  describe('after a digit', () => {
    for (const digit of ['\u1811', '1']) {
      for (const [name, ending] of ORDINALS) {
        it(`leaves ${name} after ${digit === '1' ? 'an ASCII' : 'a Mongolian'} digit alone in both modes`, () => {
          for (const conn of [MVS, NNBSP]) {
            const text = `${digit}${conn}${ending}`;
            expect(lint(text, [detachedSuffix])).toHaveLength(0);
            expect(lint(text, [detachedSuffixFormal])).toHaveLength(0);
          }
        });
      }
    }

    it('keeps the legacy-connector fix there in formal mode', () => {
      const text = `\u1811${NNBSP}${ORDINALS[0]?.[1]}`;
      expect(applyFixes(text, formal(text))).toBe(`\u1811${MVS}${ORDINALS[0]?.[1]}`);
    });
  });

  describe('a stack', () => {
    it('matches the first piece and leaves the second connector', () => {
      const text = `${nom}${MVS}${tai}${MVS}${ban}`;
      expect(lint(text)).toHaveLength(0);
      const found = formal(text);
      expect(found).toMatchObject([{ rule: 'detached-suffix', start: 3, end: 4 }]);
      expect(applyFixes(text, found)).toBe(`${nom}${tai}${MVS}${ban}`);
    });

    it('does so after NNBSP, where the second connector is still corrected', () => {
      const text = `${nom}${NNBSP}${tai}${NNBSP}${ban}`;
      expect(applyFixes(text, formal(text))).toBe(`${nom}${tai}${MVS}${ban}`);
    });
  });

  describe('fixes never overlap', () => {
    const inputs = [yabu, nom, aqa].flatMap((stem) =>
      [MVS, NNBSP].flatMap((conn) =>
        [dag, deg, ...FORMAL.map(([, e]) => e)].flatMap((ending) => [
          `${stem}${conn}${ending}`,
          `${stem}${conn}${ending}${conn}${ban}`,
        ]),
      ),
    );

    const overlaps = (text: string, active: typeof rules) => {
      const fixes = lint(text, active).filter((d) => d.fix !== undefined);
      return fixes.some((a, i) =>
        fixes.some((b, j) => i < j && a.start < b.end && b.start < a.end),
      );
    };

    it('in either mode, on any stem, connector and ending', () => {
      for (const text of inputs) {
        expect(overlaps(text, rules), text).toBe(false);
        expect(overlaps(text, formalRules), text).toBe(false);
      }
    });

    it('one formal pass leaves text that lints clean and has no legacy connector', () => {
      for (const text of inputs) {
        const fixed = applyFixes(text, formal(text));
        expect(formal(fixed), text).toHaveLength(0);
        expect(fixed.includes(NNBSP), text).toBe(false);
        expect([...fixed].filter((ch) => ch === MVS).length, text).toBe(text.includes(ban) ? 1 : 0);
      }
    });

    it('one default pass leaves text that lints clean and has no legacy connector', () => {
      for (const text of inputs) {
        const fixed = applyFixes(text, lint(text));
        expect(lint(fixed), text).toHaveLength(0);
        expect(fixed.includes(NNBSP), text).toBe(false);
      }
    });
  });
});
