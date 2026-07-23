import { fvsPlacement } from './rules/fvs-placement.js';
import { mvsContext } from './rules/mvs-context.js';
import { nnbspLegacy } from './rules/nnbsp-legacy.js';
import { noPua } from './rules/no-pua.js';
import { nonInitialO } from './rules/non-initial-o.js';
import { wrongBlock } from './rules/wrong-block.js';
import { zwjZwnj } from './rules/zwj-zwnj.js';
import type { Diagnostic, Rule } from './types.js';

export type { Diagnostic, Rule, Severity } from './types.js';
export { fvsPlacement, mvsContext, nnbspLegacy, nonInitialO, noPua, wrongBlock, zwjZwnj };

/** Every built-in rule: structural errors, then legacy/compat warnings, then hints. */
export const rules: readonly Rule[] = [
  mvsContext,
  fvsPlacement,
  noPua,
  wrongBlock,
  zwjZwnj,
  nnbspLegacy,
  nonInitialO,
];

/** Lint Mongolian-script text; diagnostics come back sorted by position. */
export function lint(text: string, active: readonly Rule[] = rules): Diagnostic[] {
  return active.flatMap((r) => r.check(text)).sort((a, b) => a.start - b.start || a.end - b.end);
}

/**
 * Apply the mechanical `fix` replacements to `text`, working in code-point
 * space — diagnostic offsets are code points, so `String.slice` (UTF-16)
 * would corrupt text containing astral characters. Fixes are applied
 * back-to-front so earlier offsets stay valid.
 */
export function applyFixes(text: string, diagnostics: readonly Diagnostic[]): string {
  const cps = [...text];
  const fixable = diagnostics.filter((d): d is Diagnostic & { fix: string } => d.fix !== undefined);
  for (const d of [...fixable].sort((a, b) => b.start - a.start)) {
    cps.splice(d.start, d.end - d.start, d.fix);
  }
  return cps.join('');
}
