import * as Mongol from './mongol.js';

export const Gender = { masculine: 0, feminine: 1, neuter: 2 } as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const Location = { isol: 0, init: 1, medi: 2, fina: 3 } as const;
export type Location = (typeof Location)[keyof typeof Location];

export function genderOf(word: readonly number[], beforeIndex?: number): Gender {
  const index = beforeIndex ?? word.length - 1;
  for (let i = index; i >= 0; i--) {
    const codeUnit = word[i] ?? 0;
    if (Mongol.isMasculineVowel(codeUnit)) {
      return Gender.masculine;
    } else if (Mongol.isFeminineVowel(codeUnit)) {
      return Gender.feminine;
    }
  }
  return Gender.neuter;
}
