import { hudumFvs } from '@gege-mn/mongol-bichig';
import { describe, expect, it } from 'vitest';
import { fvsUnregistered, lint } from '../src/index.js';

const FVS = ['', '\u180B', '\u180C', '\u180D', '\u180F'];
const MVS = '\u180E';
const NNBSP = '\u202F';

const check = (text: string) => lint(text, [fvsUnregistered]);

const inPosition = (base: string, fvs: string, position: string): string => {
  switch (position) {
    case 'isol':
      return `${base}${fvs}`;
    case 'init':
      return `${base}${fvs}ᠠ`;
    case 'medi':
      return `ᠠ${base}${fvs}ᠠ`;
    default:
      return `ᠠ${base}${fvs}`;
  }
};

describe('fvs-unregistered', () => {
  it('accepts every form Hudum registers, in its own position', () => {
    const flagged = hudumFvs
      .map((r) => ({
        r,
        text: inPosition(String.fromCodePoint(r.base), FVS[r.fvs] as string, r.position),
      }))
      .filter(({ text }) => check(text).length > 0)
      .map(({ r }) => `${r.base.toString(16)} ${r.position} ${r.fvs}`);
    expect(flagged).toEqual([]);
  });

  it('accepts the selectors in real words', () => {
    expect(check(`ᠨᠠᠶ${FVS[1]}ᠮᠠ`)).toEqual([]);
    expect(check(`ᠭ${FVS[1]}ᠡᠭᠡ`)).toEqual([]);
  });

  it('flags an FVS the letter has in no position, without a fix', () => {
    const ds = check(`ᠮ${FVS[1]}ᠠ`);
    expect(ds).toMatchObject([
      { rule: 'fvs-unregistered', severity: 'warning', code: 'GL1501', start: 1, end: 2 },
    ]);
    expect(ds[0]?.fix).toBeUndefined();
    expect(ds[0]?.message).toContain('FVS1');
  });

  it('flags every FVS on the letters that take none', () => {
    for (const base of ['ᠧ', 'ᠩ', 'ᠫ', 'ᠮ', 'ᠯ', 'ᠴ', 'ᠷ']) {
      for (const n of [1, 2, 3, 4]) expect(check(`ᠠ${base}${FVS[n]}ᠠ`)).toHaveLength(1);
    }
  });

  it('reads the joining position', () => {
    expect(check(`ᠠ${FVS[3]}`)).toEqual([]);
    expect(check(`ᠪᠠ${FVS[3]}ᠷ`)).toHaveLength(1);
    expect(check(`ᠪᠠ${FVS[3]} ᠪᠠ`)).toHaveLength(1);
  });

  it('looks through the FVS of the letter before', () => {
    expect(check(`ᠨᠠᠶ${FVS[1]}ᠠ${FVS[3]}ᠮᠠ`)).toHaveLength(1);
  });

  it('checks only per letter next to a connector, ZWJ or nirugu', () => {
    for (const mark of [MVS, NNBSP, '\u200D', '\u180A']) {
      expect(check(`ᠪᠠ${FVS[3]}${mark}ᠠ`)).toEqual([]);
      expect(check(`ᠪᠠᠮ${FVS[1]}${mark}ᠠ`)).toHaveLength(1);
    }
  });

  it('names a form that belongs to another writing system', () => {
    expect(check(`ᠠᠨ${FVS[3]}ᠠ`)).toMatchObject([{ code: 'GL1502', start: 2 }]);
  });

  it('leaves other scripts to wrong-block and stray selectors to fvs-placement', () => {
    expect(check(`ᡍ${FVS[1]}ᠠ`)).toEqual([]);
    expect(check(`${FVS[1]}ᠠ ᠠ${FVS[1]}${FVS[2]}`)).toEqual([]);
  });

  it('is in the default rule set', () => {
    expect(lint(`ᠮ${FVS[1]}ᠠ`).map((d) => d.rule)).toContain('fvs-unregistered');
  });
});
