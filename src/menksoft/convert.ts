import * as Menksoft from './menksoft.js';
import { MenksoftWord } from './word.js';

const CHUNK = 0x2000;

export function convertMenksoftToUnicode(text: string): string {
  if (text.length === 0) return '';

  const outputString: number[] = [];
  const menksoftWord: number[] = [];

  const length = text.length;
  for (let i = 0; i < length; i++) {
    const codeUnit = text.charCodeAt(i);
    if (Menksoft.isMenksoft(codeUnit) && !Menksoft.isSpace(codeUnit)) {
      menksoftWord.push(codeUnit);
      continue;
    }

    if (menksoftWord.length > 0) {
      appendMenksoftWord(outputString, menksoftWord);
      menksoftWord.length = 0;
    }

    // A space starts a new Mongol word but is not itself a Mongol char
    if (Menksoft.isSpace(codeUnit)) {
      menksoftWord.push(codeUnit);
      continue;
    }

    outputString.push(codeUnit);
  }

  if (menksoftWord.length > 0) {
    appendMenksoftWord(outputString, menksoftWord);
  }

  let result = '';
  for (let i = 0; i < outputString.length; i += CHUNK) {
    result += String.fromCharCode(...outputString.slice(i, i + CHUNK));
  }
  return result;
}

function appendMenksoftWord(outputString: number[], menksoftWord: number[]): void {
  for (const codeUnit of new MenksoftWord(menksoftWord).convertToUnicode()) {
    outputString.push(codeUnit);
  }
}
