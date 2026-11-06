import { undottedSha as findUndottedSha } from '@gege-mn/mongol-bichig';
import { msg } from '../messages/index.js';
import type { Diagnostic, Rule } from '../types.js';

/**
 * SHA directly before I with no selector. UTN #57 makes the dotless form the
 * default there, so the font draws SA and жишээ, spelled with SHA in the
 * dictionary, reads as if spelled with s. Where and why: mongol-bichig
 * `variation-sequences.md`, "SHA before I"; the owner ruled on 2026-11-07
 * that SHA before I always takes FVS2.
 *
 * The fix is safe unasked: FVS2 selects the dotted form, the one the letter
 * SHA exists to show. A deliberate FVS1 is not a bare pair and is not reported.
 */
export const undottedSha: Rule = {
  name: 'undotted-sha',
  check(text) {
    return findUndottedSha(text).map(
      (i): Diagnostic => ({
        rule: 'undotted-sha',
        severity: 'warning',
        ...msg('undotted-sha/dotless'),
        start: i,
        end: i + 1,
        fix: '\u1831\u180C',
      }),
    );
  },
};
