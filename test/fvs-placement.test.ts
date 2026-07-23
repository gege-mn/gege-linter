import { describe, expect, it } from 'vitest';
import { fvsPlacement, lint } from '../src/index.js';

const FVS1 = '\u180B';
const FVS2 = '\u180C';

describe('fvs-placement', () => {
  it('accepts FVS directly after a Mongolian letter', () => {
    expect(lint(`ᠭ${FVS1}ᠡᠭᠡ`, [fvsPlacement])).toHaveLength(0);
  });

  it('flags FVS with no letter before it', () => {
    expect(lint(`${FVS1}ᠠ`, [fvsPlacement])).toMatchObject([{ start: 0, severity: 'error' }]);
    expect(lint(`1${FVS1}`, [fvsPlacement])).toHaveLength(1);
  });

  it('flags the second selector of a doubled FVS, naming it', () => {
    const ds = lint(`ᠠ${FVS1}${FVS2}`, [fvsPlacement]);
    expect(ds).toMatchObject([{ start: 2 }]);
    expect(ds[0]?.message).toContain('FVS2');
  });
});
