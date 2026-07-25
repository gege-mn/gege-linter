/**
 * Shared character classes for the Mongolian block (U+1800–18AF).
 *
 * These are not the linter's own — they live in `@gege-mn/mongol-bichig`
 * alongside the reference documents that define them, so the linter and the
 * converter cannot drift apart on what counts as a Mongolian letter or which
 * code point the suffix connector is. Re-exported here so rule modules keep
 * importing from one place.
 */

export {
  cp,
  FVS,
  harmonyOf,
  isDigit,
  isHudumLetter,
  isMongolLetter,
  isVowel,
  MVS,
  NIRUGU,
  NNBSP,
  prevBaseCp,
  uplus,
  ZWJ,
  ZWNJ,
} from '@gege-mn/mongol-bichig';
