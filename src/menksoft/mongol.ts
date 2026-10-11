export const zwj = 0x200d; // Zero-width joiner

export const nnbs = 0x202f; // Narrow No-Break Space

// punctuation
export const space = 0x0020;
export const percent = 0x0025;
export const plus = 0x002b;
export const minus = 0x002d;
export const equals = 0x003d;
export const tilde = 0x007e;
export const middleDot = 0x00b7;
export const questionExclamation = 0x2048;
export const exclamationQuestion = 0x2049;
export const fullwidthSemicolon = 0xff1b;
export const fullwidthExclamation = 0xff01;
export const fullwidthQuestion = 0xff1f;
export const fullwidthHyphenMinus = 0xff0d;
export const fullwidthLeftParenthesis = 0xff08;
export const fullwidthRightParenthesis = 0xff09;
export const leftDoubleAngleBracket = 0x300a;
export const rightDoubleAngleBracket = 0x300b;
export const leftAngleBracket = 0x3008;
export const rightAngleBracket = 0x3009;
export const fullwidthLeftSquareBracket = 0xff3b;
export const fullwidthRightSquareBracket = 0xff3d;

// Additional punctuation not defined by the 2023 standard
export const verticalComma = 0xfe10;
export const verticalColon = 0xfe13;
export const verticalEmDash = 0xfe31;
export const verticalEnDash = 0xfe32;
export const verticalLeftTortoiseShellBracket = 0xfe39;
export const verticalRightTortoiseShellBracket = 0xfe3a;
export const verticalLeftWhiteCornerBracket = 0xfe43;
export const verticalRightWhiteCornerBracket = 0xfe44;
export const referenceMark = 0x203b;
export const punctuationX = 0x00d7;

// Unicode Mongolian Values
export const birga = 0x1800;
export const ellipsis = 0x1801;
export const comma = 0x1802;
export const fullStop = 0x1803;
export const colon = 0x1804;
export const fourDots = 0x1805;
export const todoSoftHyphen = 0x1806;
export const sibeSyllableBoundaryMarker = 0x1807;
export const manchuComma = 0x1808;
export const manchuFullStop = 0x1809;
export const nirugu = 0x180a;
export const fvs1 = 0x180b;
export const fvs2 = 0x180c;
export const fvs3 = 0x180d;
export const mvs = 0x180e; // MONGOLIAN_VOWEL_SEPARATOR
export const fvs4 = 0x180f;
export const digitZero = 0x1810;
export const digitOne = 0x1811;
export const digitTwo = 0x1812;
export const digitThree = 0x1813;
export const digitFour = 0x1814;
export const digitFive = 0x1815;
export const digitSix = 0x1816;
export const digitSeven = 0x1817;
export const digitEight = 0x1818;
export const digitNine = 0x1819;
export const a = 0x1820;
export const e = 0x1821;
export const i = 0x1822;
export const o = 0x1823;
export const u = 0x1824;
export const oe = 0x1825;
export const ue = 0x1826;
export const ee = 0x1827;
export const na = 0x1828;
export const ang = 0x1829;
export const ba = 0x182a;
export const pa = 0x182b;
export const qa = 0x182c;
export const ga = 0x182d;
export const ma = 0x182e;
export const la = 0x182f;
export const sa = 0x1830;
export const sha = 0x1831;
export const ta = 0x1832;
export const da = 0x1833;
export const cha = 0x1834;
export const ja = 0x1835;
export const ya = 0x1836;
export const ra = 0x1837;
export const wa = 0x1838;
export const fa = 0x1839;
export const ka = 0x183a;
export const kha = 0x183b;
export const tsa = 0x183c;
export const za = 0x183d;
export const haa = 0x183e;
export const zra = 0x183f;
export const lha = 0x1840;
export const zhi = 0x1841;
export const chi = 0x1842;

export function isConsonant(codeUnit: number): boolean {
  return codeUnit >= na && codeUnit <= chi;
}

export function isVowel(codeUnit: number): boolean {
  return codeUnit >= a && codeUnit <= ee;
}

export function isMasculineVowel(codeUnit: number): boolean {
  return codeUnit === a || codeUnit === o || codeUnit === u;
}

export function isFeminineVowel(codeUnit: number): boolean {
  return codeUnit === e || codeUnit === ee || codeUnit === oe || codeUnit === ue;
}

export function isFVS(codeUnit: number): boolean {
  return codeUnit === fvs1 || codeUnit === fvs2 || codeUnit === fvs3 || codeUnit === fvs4;
}

// Whether the U or OE at the given index needs a long tooth.
export function needsLongToothU(word: readonly number[], index: number): boolean {
  if (index < 0) return false;

  if (word[index] !== oe && word[index] !== ue) {
    return false;
  }

  if (index === 0) return true;

  if (index === 1) {
    if (isConsonant(word[0] ?? 0)) {
      return true;
    }
  }

  if (index === 2) {
    return isConsonant(word[0] ?? 0) && isFVS(word[1] ?? 0);
  }

  return false;
}
