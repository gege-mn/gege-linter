/** Shared character classes for the Mongolian block (U+1800–18AF). */

export const MVS = '\u180E';
export const NNBSP = '\u202F';
export const NIRUGU = '\u180A';
export const ZWNJ = '\u200C';
export const ZWJ = '\u200D';

/** Free variation selectors, mapped to their number (FVS4 is U+180F, not U+180E). */
export const FVS: ReadonlyMap<string, number> = new Map([
  ['\u180B', 1],
  ['\u180C', 2],
  ['\u180D', 3],
  ['\u180F', 4],
]);

/** Any Mongolian letter: Hudum, Todo, Sibe, Manchu, Ali Gali (U+1820–18AA). */
export const isMongolLetter = (c: number): boolean => c >= 0x1820 && c <= 0x18aa;

/** The modern Hudum alphabet (CLDR mn_Mong exemplars). */
export const isHudumLetter = (c: number): boolean => c >= 0x1820 && c <= 0x1842;

/** Hudum vowels ᠠ ᠡ ᠢ ᠣ ᠤ ᠥ ᠦ ᠧ (U+1820–1827). */
export const isVowel = (c: number): boolean => c >= 0x1820 && c <= 0x1827;

/** Mongolian (U+1810–1819) or ASCII digit. */
export const isDigit = (c: number): boolean =>
  (c >= 0x1810 && c <= 0x1819) || (c >= 0x30 && c <= 0x39);

/** Code point of a (possibly missing) single-code-point string; -1 when absent. */
export const cp = (ch: string | undefined): number => ch?.codePointAt(0) ?? -1;

/** Code point of the base character before index i, looking through any FVS run. */
export const prevBaseCp = (cps: readonly string[], i: number): number => {
  let j = i - 1;
  while (j >= 0) {
    const ch = cps[j];
    if (ch === undefined || !FVS.has(ch)) break;
    j--;
  }
  return cp(cps[j]);
};

/** `U+1823`-style label for a code point or single-code-point string. */
export const uplus = (v: number | string): string =>
  `U+${(typeof v === 'string' ? cp(v) : v).toString(16).toUpperCase().padStart(4, '0')}`;
