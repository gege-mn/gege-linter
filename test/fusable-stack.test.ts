import { describe, expect, it } from 'vitest';
import { applyFixes, fusableStack, lint, rules } from '../src/index.js';

const MVS = '\u180E';
const NNBSP = '\u202F';
const FVS1 = '\u180B';

/** ᠨᠡᠷ + dative ᠳᠤ + reflexive ᠪᠠᠨ, written analytically (задлаг). */
const nerDuBan = `ᠨᠡᠷ${MVS}ᠳᠤ${MVS}ᠪᠠᠨ`;

describe('fusable-stack', () => {
  it('offers the fused ᠳᠠᠭᠠᠨ for an analytic ᠳᠤ + ᠪᠠᠨ stack', () => {
    const ds = lint(nerDuBan, [fusableStack]);
    expect(ds).toHaveLength(1);
    expect(ds[0]?.severity).toBe('info');
    // The span covers the whole stack, connector included, so a consumer can
    // replace it with connector + fused sequence.
    expect(ds[0]?.start).toBe(3);
    expect(ds[0]?.end).toBe(nerDuBan.length);
    expect(ds[0]?.message).toContain('ᠳᠠᠭᠠᠨ');
  });

  it('never offers a mechanical fix — both spellings are correct', () => {
    // If this ever gains a `fix`, `--fix` would rewrite an author's style.
    const ds = lint(nerDuBan, [fusableStack]);
    expect(ds[0]?.fix).toBeUndefined();
    expect(applyFixes(nerDuBan, lint(nerDuBan))).toBe(nerDuBan);
  });

  it('handles the feminine mate: ᠳᠦ + ᠪᠡᠨ offers ᠳᠡᠭᠡᠨ', () => {
    const text = `ᠮᠣᠷᠢᠨ${MVS}ᠳᠦ${MVS}ᠪᠡᠨ`;
    const ds = lint(text, [fusableStack]);
    expect(ds).toHaveLength(1);
    expect(ds[0]?.message).toContain('ᠳᠡᠭᠡᠨ');
  });

  it('covers the hard-final dative and the ablative too', () => {
    const tuBan = `ᠠᠮᠠ${MVS}ᠲᠤ${MVS}ᠪᠠᠨ`;
    const echeBen = `ᠨᠡᠷ${MVS}ᠡᠴᠡ${MVS}ᠪᠡᠨ`;
    expect(lint(tuBan, [fusableStack])).toHaveLength(1);
    expect(lint(echeBen, [fusableStack])).toHaveLength(1);
  });

  it('reads legacy NNBSP-joined stacks as the same thing', () => {
    const text = `ᠨᠡᠷ${NNBSP}ᠳᠤ${NNBSP}ᠪᠠᠨ`;
    expect(lint(text, [fusableStack])).toHaveLength(1);
  });

  it('stays silent on a bare dative with no reflexive after it', () => {
    expect(lint(`ᠨᠡᠷ${MVS}ᠳᠤ`, [fusableStack])).toHaveLength(0);
  });

  it('stays silent on a stack that is already fused', () => {
    const fused = `ᠨᠡᠷ${MVS}ᠳᠠᠭᠠᠨ`;
    expect(lint(fused, [fusableStack])).toHaveLength(0);
  });

  it('does not match when the reflexive runs on into more letters', () => {
    const text = `ᠨᠡᠷ${MVS}ᠳᠤ${MVS}ᠪᠠᠨᠳ`;
    expect(lint(text, [fusableStack])).toHaveLength(0);
  });

  it('needs a stem in front of the connector, not a bare stack', () => {
    expect(lint(`${MVS}ᠳᠤ${MVS}ᠪᠠᠨ`, [fusableStack])).toHaveLength(0);
  });

  it('tolerates a trailing selector on the last letter', () => {
    expect(lint(`${nerDuBan}${FVS1}`, [fusableStack])).toHaveLength(1);
  });

  it('is only a hint — it never raises the CLI exit severity', () => {
    expect(lint(nerDuBan, [fusableStack]).every((d) => d.severity !== 'error')).toBe(true);
  });

  it('is opt-in: the default rule set stays silent on a correct analytic stack', () => {
    // It reports text that is *right*, so it is exported but not in `rules`.
    // The owner ruled on 2026-07-27 that a CLI/CI run must not carry it.
    expect(lint(nerDuBan)).toHaveLength(0);
    expect(lint(nerDuBan, [...rules, fusableStack])).toHaveLength(1);
  });
});
