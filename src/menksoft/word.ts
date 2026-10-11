import { checkFixedSequenceMenkToUni } from './fixed-words.js';
import * as Menksoft from './menksoft.js';
import * as Mongol from './mongol.js';
import { Gender, genderOf, Location } from './shared.js';

const SPACE = 0x0020;

export class MenksoftWord {
  private readonly inputWord: number[];
  private location: Location = Location.isol;

  constructor(menksoftWord: number[]) {
    this.inputWord = menksoftWord;
  }

  private updateLocation(charAbove: number, charBelow: number): void {
    const isTop = !Menksoft.isLetter(charAbove);
    const isBottom = !Menksoft.isLetter(charBelow);
    if (isTop) {
      if (isBottom) {
        this.location = Location.isol;
      } else {
        this.location = Location.init;
      }
    } else {
      if (isBottom) {
        this.location = Location.fina;
      } else {
        this.location = Location.medi;
      }
    }
  }

  convertToUnicode(): number[] {
    if (this.inputWord.length === 0) {
      return [];
    }

    const fixedSequence = checkFixedSequenceMenkToUni(this.inputWord);
    if (fixedSequence !== null) {
      return fixedSequence;
    }

    const outputString: number[] = [];

    let charAbove = 0;
    let currentChar = this.inputWord[0] ?? 0;
    const length = this.inputWord.length;
    for (let i = 0; i < length; i++) {
      const charBelow = i < length - 1 ? (this.inputWord[i + 1] ?? 0) : 0;

      this.updateLocation(charAbove, charBelow);

      if (this.isMenksoftSpaceChar(currentChar)) {
        this.handleSpace(outputString, currentChar, charBelow);
      } else if (currentChar < Menksoft.aStart) {
        this.handlePunctuation(outputString, currentChar);
      } else if (currentChar < Menksoft.eStart) {
        this.handleA(outputString, currentChar);
      } else if (currentChar < Menksoft.iStart) {
        this.handleE(outputString, currentChar);
      } else if (currentChar < Menksoft.oStart) {
        this.handleI(outputString, currentChar, charAbove, charBelow);
      } else if (currentChar < Menksoft.uStart) {
        this.handleO(outputString, currentChar);
      } else if (currentChar < Menksoft.oeStart) {
        this.handleU(outputString, currentChar);
      } else if (currentChar < Menksoft.ueStart) {
        this.handleOE(outputString, currentChar);
      } else if (currentChar < Menksoft.eeStart) {
        this.handleUE(outputString, currentChar);
      } else if (currentChar < Menksoft.naStart) {
        this.handleEE(outputString, currentChar, charAbove, charBelow);
      } else if (Menksoft.isAng(currentChar)) {
        // handling ANG before NA because NA is appears
        // before and after ANG
        this.handleAng(outputString, currentChar);
      } else if (currentChar < Menksoft.baStart) {
        this.handleNa(outputString, currentChar, charAbove, charBelow);
      } else if (currentChar < Menksoft.paStart) {
        this.handleBa(outputString, currentChar);
      } else if (currentChar < Menksoft.qaStart) {
        this.handlePa(outputString, currentChar);
      } else if (currentChar < Menksoft.gaStart) {
        this.handleQa(outputString, currentChar, charBelow);
      } else if (currentChar < Menksoft.maStart) {
        this.handleGa(outputString, currentChar, charAbove, charBelow);
      } else if (currentChar < Menksoft.laStart) {
        this.handleMa(outputString, currentChar);
      } else if (currentChar < Menksoft.saStart) {
        this.handleLa(outputString, currentChar);
      } else if (currentChar < Menksoft.shaStart) {
        this.handleSa(outputString, currentChar);
      } else if (currentChar < Menksoft.taStart) {
        this.handleSha(outputString, currentChar);
      } else if (currentChar < Menksoft.daStart) {
        this.handleTa(outputString, currentChar);
      } else if (currentChar < Menksoft.chaStart) {
        this.handleDa(outputString, currentChar, charBelow);
      } else if (currentChar < Menksoft.jaStart) {
        this.handleCha(outputString, currentChar);
      } else if (currentChar < Menksoft.yaStart) {
        this.handleJa(outputString, currentChar);
      } else if (currentChar < Menksoft.raStart) {
        this.handleYa(outputString, currentChar, charAbove, charBelow);
      } else if (currentChar < Menksoft.waStart) {
        this.handleRa(outputString, currentChar);
      } else if (currentChar < Menksoft.faStart) {
        this.handleWa(outputString, currentChar, charAbove, charBelow);
      } else if (currentChar < Menksoft.kaStart) {
        this.handleFa(outputString, currentChar);
      } else if (currentChar < Menksoft.khaStart) {
        this.handleKa(outputString, currentChar);
      } else if (currentChar < Menksoft.tsaStart) {
        this.handleKha(outputString, currentChar);
      } else if (currentChar < Menksoft.zaStart) {
        this.handleTsa(outputString, currentChar);
      } else if (currentChar < Menksoft.haaStart) {
        this.handleZa(outputString, currentChar);
      } else if (currentChar < Menksoft.zraStart) {
        this.handleHaa(outputString, currentChar);
      } else if (currentChar < Menksoft.lhaStart) {
        this.handleZra(outputString, currentChar);
      } else if (currentChar < Menksoft.zhiStart) {
        this.handleLha(outputString, currentChar);
      } else if (currentChar < Menksoft.chiStart) {
        this.handleZhi(outputString);
      } else if (currentChar <= Menksoft.menksoftEnd) {
        this.handleChi(outputString);
      }

      charAbove = currentChar;

      // fix missing space
      if (Menksoft.isFinalIsolateGlyph(currentChar) && Menksoft.isInitialIsolateGlyph(charBelow)) {
        outputString.push(SPACE);
        charAbove = 0;
      }

      currentChar = charBelow;
    }

    return outputString;
  }

  private handleA(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.aIsolFvs1:
            outputString.push(Mongol.a);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.aIsolFvs2:
            outputString.push(Mongol.a);
            outputString.push(Mongol.fvs2);
            break;
          case Menksoft.aInit:
            outputString.push(Mongol.a);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.aInitFvs1:
            outputString.push(Mongol.a);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.aFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.a);
            break;
          case Menksoft.aFinaBp:
          case Menksoft.aFinaFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.a);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.aMedi:
          case Menksoft.aMediBp:
          case Menksoft.aMediUnknown:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.a);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.aMediFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.a);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.a);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.aMedi:
          case Menksoft.aMediBp:
          case Menksoft.aMediUnknown:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.a);
            break;
          case Menksoft.aMediFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.a);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.a);
            break;
        }
        break;
      case Location.medi:
        outputString.push(Mongol.a);
        if (currentChar === Menksoft.aMediFvs1) {
          outputString.push(Mongol.fvs1);
        }
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.aFinaMvs:
            outputString.push(Mongol.mvs);
            outputString.push(Mongol.a);
            break;
          case Menksoft.aMedi:
          case Menksoft.aMediBp:
          case Menksoft.aMediUnknown:
            outputString.push(Mongol.a);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.aMediFvs1:
            outputString.push(Mongol.a);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.a);
            break;
        }
        break;
    }
  }

  private handleE(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.eIsolFvs1:
            outputString.push(Mongol.e);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.eInit:
            outputString.push(Mongol.e);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.eInitFvs1:
            outputString.push(Mongol.e);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.eFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.e);
            break;
          case Menksoft.eFinaBp:
          case Menksoft.eFinaFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.e);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.eMedi:
          case Menksoft.eMediBp:
          case Menksoft.eMediUnknown:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.e);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.e);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.eInitFvs1:
            outputString.push(Mongol.e);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.eMedi:
          case Menksoft.eMediBp:
          case Menksoft.eMediUnknown:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.e);
            break;
          default:
            outputString.push(Mongol.e);
            break;
        }
        break;
      case Location.medi:
        outputString.push(Mongol.e);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.eFinaMvs:
            outputString.push(Mongol.mvs);
            outputString.push(Mongol.e);
            break;
          case Menksoft.eMedi:
          case Menksoft.eMediBp:
          case Menksoft.eMediUnknown:
            outputString.push(Mongol.e);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.e);
            break;
        }
        break;
    }
  }

  private handleI(
    outputString: number[],
    currentChar: number,
    charAbove: number,
    charBelow: number,
  ): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.iIsolFvs1:
            outputString.push(Mongol.i);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.iInit:
            outputString.push(Mongol.i);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.iFina:
          case Menksoft.iFinaBp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.i);
            break;
          case Menksoft.iMedi:
          case Menksoft.iMediBp:
          case Menksoft.iInitFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.i);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.iMediFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.i);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.iMediFvs2:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.i);
            outputString.push(Mongol.fvs2);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.i);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.iMedi:
          case Menksoft.iMediBp:
          case Menksoft.iInitFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.i);
            break;
          case Menksoft.iMediFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.i);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.iMediFvs2:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ya);
            outputString.push(Mongol.i);
            break;
          default:
            outputString.push(Mongol.i);
            break;
        }
        break;
      case Location.medi:
        switch (currentChar) {
          case Menksoft.iMedi:
          case Menksoft.iMediBp:
            if (Menksoft.isVowel(charAbove) && this.isLongToothI(charBelow)) {
              // Drop the I. It isn't needed for diphthongs.
            } else {
              outputString.push(Mongol.i);
              if (this.isMenksoftA(charAbove) && this.isMenksoftM(charBelow)) {
                // override double tooth for words like NAIMA
                outputString.push(Mongol.fvs3);
              }
            }
            break;
          case Menksoft.iMediFvs1:
            outputString.push(Mongol.i);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.i);
            break;
        }
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.iMedi:
          case Menksoft.iMediBp:
          case Menksoft.iInitFvs1:
            outputString.push(Mongol.i);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.iMediFvs1:
            outputString.push(Mongol.i);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.iMediFvs2:
            outputString.push(Mongol.ya);
            outputString.push(Mongol.i);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.i);
            break;
        }
        break;
    }
  }

  private isLongToothI(character: number): boolean {
    return (
      character === Menksoft.iMedi ||
      character === Menksoft.iMediBp ||
      character === Menksoft.iInitFvs1 ||
      character === Menksoft.yaMediFvs1
    );
  }

  private isMenksoftA(character: number): boolean {
    return character >= Menksoft.aStart && character <= Menksoft.aMediUnknown;
  }

  private isMenksoftM(character: number): boolean {
    return character >= Menksoft.maInitTooth && character <= Menksoft.maMediBp;
  }

  private handleO(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.oInit:
            outputString.push(Mongol.o);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.oFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.o);
            break;
          case Menksoft.oFinaFvs1:
          case Menksoft.oFinaFvs1Bp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.o);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.oMediFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.o);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.oMedi:
          case Menksoft.oMediBp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.o);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.o);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.oMediFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.o);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.oMedi:
          case Menksoft.oMediBp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.o);
            break;
          default:
            outputString.push(Mongol.o);
            break;
        }
        break;
      case Location.medi:
        switch (currentChar) {
          case Menksoft.oMediFvs1:
            outputString.push(Mongol.o);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.o);
            break;
        }
        break;
      case Location.fina:
        outputString.push(Mongol.o);
        switch (currentChar) {
          case Menksoft.oFinaFvs1:
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.oFina:
            if (this.inputWord.length === 2) {
              outputString.push(Mongol.fvs2);
            }
            break;
          case Menksoft.oMediFvs1:
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.oMedi:
          case Menksoft.oMediBp:
            outputString.push(Mongol.nirugu);
            break;
        }
        break;
    }
  }

  private handleU(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.uInit:
            outputString.push(Mongol.u);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.uFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.u);
            break;
          case Menksoft.uFinaFvs1:
          case Menksoft.uFinaFvs1Bp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.u);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.uMediFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.u);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.uMedi:
          case Menksoft.uMediBp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.u);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.u);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.uMediFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.u);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.uMedi:
          case Menksoft.uMediBp:
            outputString.push(Mongol.u);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.u);
            break;
        }
        break;
      case Location.medi:
        switch (currentChar) {
          case Menksoft.uMediFvs1:
            outputString.push(Mongol.u);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.u);
            break;
        }
        break;
      case Location.fina:
        outputString.push(Mongol.u);
        switch (currentChar) {
          case Menksoft.uFinaFvs1:
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.uFina:
            if (this.inputWord.length === 2) {
              outputString.push(Mongol.fvs2);
            }
            break;
          case Menksoft.uMediFvs1:
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.uMedi:
          case Menksoft.uMediBp:
            outputString.push(Mongol.nirugu);
            break;
        }
        break;
    }
  }

  private handleOE(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.oeIsolFvs1:
            outputString.push(Mongol.oe);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.oeInit:
            outputString.push(Mongol.oe);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.oeFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.oe);
            break;
          case Menksoft.oeFinaFvs1:
          case Menksoft.oeFinaFvs1Bp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.oe);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.oeFinaFvs2:
          case Menksoft.oeFinaFvs2Bp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.oe);
            outputString.push(Mongol.fvs2);
            break;
          case Menksoft.oeMediFvs2:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.oe);
            outputString.push(Mongol.fvs2);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.oeMedi:
          case Menksoft.oeMediBp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.oe);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.oeMediFvs1:
          case Menksoft.oeMediFvs1Bp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.oe);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.oe);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.oeMediFvs2:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.oe);
            outputString.push(Mongol.fvs2);
            break;
          case Menksoft.oeMedi:
          case Menksoft.oeMediBp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.oe);
            break;
          case Menksoft.oeMediFvs1:
          case Menksoft.oeMediFvs1Bp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.oe);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.oe);
            break;
        }
        break;
      case Location.medi:
        switch (currentChar) {
          case Menksoft.oeMediFvs1:
          case Menksoft.oeMediFvs1Bp: {
            outputString.push(Mongol.oe);
            const index = outputString.length - 1;
            if (!Mongol.needsLongToothU(outputString, index)) {
              outputString.push(Mongol.fvs1);
            }
            break;
          }
          case Menksoft.oeMediFvs2:
            outputString.push(Mongol.oe);
            outputString.push(Mongol.fvs2);
            break;
          default:
            outputString.push(Mongol.oe);
            break;
        }
        break;
      case Location.fina:
        outputString.push(Mongol.oe);
        switch (currentChar) {
          case Menksoft.oeFinaFvs1:
          case Menksoft.oeFinaFvs1Bp:
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.oeFina:
            if (this.inputWord.length === 2) {
              outputString.push(Mongol.fvs3);
            }
            break;
          case Menksoft.oeMediFvs2:
            outputString.push(Mongol.fvs2);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.oeMedi:
          case Menksoft.oeMediBp:
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.oeMediFvs1:
          case Menksoft.oeMediFvs1Bp:
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
        }
        break;
    }
  }

  private handleUE(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.ueIsolFvs1:
            outputString.push(Mongol.ue);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.ueInit:
            outputString.push(Mongol.ue);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.ueFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ue);
            break;
          case Menksoft.ueFinaFvs1:
          case Menksoft.ueFinaFvs1Bp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ue);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.ueFinaFvs2:
          case Menksoft.ueFinaFvs2Bp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ue);
            outputString.push(Mongol.fvs2);
            break;
          case Menksoft.ueMediFvs2:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ue);
            outputString.push(Mongol.fvs2);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.ueMedi:
          case Menksoft.ueMediBp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ue);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.ueMediFvs1:
          case Menksoft.ueMediFvs1Bp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ue);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.ue);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.ueInitFvs1:
          case Menksoft.ueMedi:
            outputString.push(Mongol.ue);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.ueMediFvs1:
          case Menksoft.ueMediFvs1Bp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ue);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.ueMediFvs2:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ue);
            outputString.push(Mongol.fvs2);
            break;
          default:
            outputString.push(Mongol.ue);
            break;
        }
        break;
      case Location.medi:
        switch (currentChar) {
          case Menksoft.ueMediFvs1:
          case Menksoft.ueMediFvs1Bp: {
            outputString.push(Mongol.ue);
            const index = outputString.length - 1;
            if (!Mongol.needsLongToothU(outputString, index)) {
              outputString.push(Mongol.fvs1);
            }
            break;
          }
          case Menksoft.ueMediFvs2:
            outputString.push(Mongol.ue);
            outputString.push(Mongol.fvs2);
            break;
          default:
            outputString.push(Mongol.ue);
            break;
        }
        break;
      case Location.fina:
        outputString.push(Mongol.ue);
        switch (currentChar) {
          case Menksoft.ueFinaFvs1:
          case Menksoft.ueFinaFvs1Bp:
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.ueFina:
            if (this.inputWord.length === 2) {
              outputString.push(Mongol.fvs3);
            }
            break;
          case Menksoft.ueMediFvs2:
            outputString.push(Mongol.fvs2);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.ueMedi:
          case Menksoft.ueMediBp:
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.ueMediFvs1:
          case Menksoft.ueMediFvs1Bp:
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
        }
        break;
    }
  }

  private handleEE(
    outputString: number[],
    currentChar: number,
    _charAbove: number,
    _charBelow: number,
  ): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.eeInit:
            outputString.push(Mongol.ee);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.eeMedi:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ee);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.eeFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ee);
            break;
          default:
            outputString.push(Mongol.ee);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.eeMedi:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ee);
            break;
          default:
            outputString.push(Mongol.ee);
            break;
        }
        break;
      case Location.medi:
        outputString.push(Mongol.ee);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.eeMedi:
            outputString.push(Mongol.ee);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.ee);
            break;
        }
        break;
    }
  }

  private handleAng(outputString: number[], currentChar: number): void {
    if (this.location === Location.isol && currentChar === Menksoft.angFina) {
      outputString.push(Mongol.nirugu);
    }
    outputString.push(Mongol.ang);
  }

  private handleNa(
    outputString: number[],
    currentChar: number,
    charAbove: number,
    charBelow: number,
  ): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.naInitFvs1Stem:
          case Menksoft.naInitFvs1Tooth:
            outputString.push(Mongol.na);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.naFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.na);
            break;
          case Menksoft.naFinaFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.na);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.naMediStem:
          case Menksoft.naMediTooth:
          case Menksoft.naMediNg:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.na);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.naMediFvs1Stem:
          case Menksoft.naMediFvs1Tooth:
          case Menksoft.naMediFvs1Ng:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.na);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.na);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.naInitFvs1Stem:
          case Menksoft.naInitFvs1Tooth:
            outputString.push(Mongol.na);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.na);
            break;
        }
        break;
      case Location.medi:
        switch (currentChar) {
          case Menksoft.naMediNg:
          case Menksoft.naMediStem:
          case Menksoft.naMediTooth:
            outputString.push(Mongol.na);
            if (Menksoft.isVowel(charAbove) && Menksoft.isVowel(charBelow)) {
              outputString.push(Mongol.fvs2);
            }
            break;
          case Menksoft.naMediFvs1Ng:
          case Menksoft.naMediFvs1Stem:
          case Menksoft.naMediFvs1Tooth:
            outputString.push(Mongol.na);
            if (Menksoft.isConsonant(charBelow)) {
              outputString.push(Mongol.fvs1);
            }
            break;
          default:
            outputString.push(Mongol.na);
            break;
        }
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.naFinaFvs1:
            outputString.push(Mongol.na);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.naMediStem:
          case Menksoft.naMediTooth:
          case Menksoft.naMediNg:
            outputString.push(Mongol.na);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.naMediFvs1Stem:
          case Menksoft.naMediFvs1Tooth:
          case Menksoft.naMediFvs1Ng:
            outputString.push(Mongol.na);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.na);
            break;
        }
        break;
    }
  }

  private handleBa(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.baFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ba);
            break;
          case Menksoft.baFinaFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ba);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.ba);
            break;
        }
        break;
      case Location.init:
        outputString.push(Mongol.ba);
        break;
      case Location.medi:
        outputString.push(Mongol.ba);
        break;
      case Location.fina:
        outputString.push(Mongol.ba);
        break;
    }
  }

  private handlePa(outputString: number[], currentChar: number): void {
    if (this.location === Location.isol && currentChar === Menksoft.paFina) {
      outputString.push(Mongol.nirugu);
    }
    outputString.push(Mongol.pa);
  }

  private handleQa(outputString: number[], currentChar: number, charBelow: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.qaIsolFvs1:
          case Menksoft.qaInitFvs1Tooth:
            // treat the dotted masculine Q as a G
            outputString.push(Mongol.ga);
            break;
          case Menksoft.qaIsolFvs2:
          case Menksoft.qaInitFvs2Ou:
          case Menksoft.qaMediFvs2Cons:
          case Menksoft.qaMediFvs2Ou:
          case Menksoft.qaMediFvs2:
            outputString.push(Mongol.qa);
            outputString.push(Mongol.fvs2);
            break;
          case Menksoft.qaIsolFvs4:
          case Menksoft.qaInitFvs4Ou:
          case Menksoft.qaMediFvs4:
          case Menksoft.qaMediFvs4Ou:
          case Menksoft.qaMediFvs4Cons:
            outputString.push(Mongol.qa);
            outputString.push(Mongol.fvs4);
            break;
          case Menksoft.qaFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.qa);
            break;
          case Menksoft.qaFinaFvs1:
            // treat the dotted masculine Q as a G
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ga);
            outputString.push(Mongol.fvs3);
            break;
          case Menksoft.qaMediFvs1:
            // treat the dotted masculine Q as a G
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ga);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.qaMediStem:
          case Menksoft.qaMediTooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.qa);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.qa);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.qaInitFvs1Stem:
          case Menksoft.qaInitFvs1Tooth:
            // treat the dotted masculine Q as a G
            outputString.push(Mongol.ga);
            break;
          case Menksoft.qaMediStem:
          case Menksoft.qaMediTooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.qa);
            break;
          default:
            outputString.push(Mongol.qa);
            break;
        }
        break;
      case Location.medi:
        switch (currentChar) {
          case Menksoft.qaMediStem:
          case Menksoft.qaMediTooth:
            // If a medial Q is being used like a G before
            // a consonant, then interpret it as a G.
            if (Menksoft.isConsonant(charBelow)) {
              outputString.push(Mongol.ga);
            } else {
              outputString.push(Mongol.qa);
            }
            break;
          case Menksoft.qaMediFvs1:
          case Menksoft.qaMediFvs1Mvs:
            // treat the dotted masculine Q as a G
            outputString.push(Mongol.ga);
            break;
          case Menksoft.qaMediFvs2:
          case Menksoft.qaMediFvs2Ou:
          case Menksoft.qaMediFvs2Cons:
            if (this.inputWordContainsMasculineVowel() && Menksoft.isConsonant(charBelow)) {
              // treat feminine QA before a consonant as a GA
              outputString.push(Mongol.ga);
              outputString.push(Mongol.fvs2);
            } else {
              outputString.push(Mongol.qa);
            }
            break;
          default:
            outputString.push(Mongol.qa);
            break;
        }
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.qaMediFvs2Cons:
            outputString.push(Mongol.ga);
            outputString.push(Mongol.fvs3);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.qaMediFvs1:
            // treat the dotted masculine Q as a G
            outputString.push(Mongol.ga);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.qaMediFvs1Mvs:
            // treat the dotted masculine Q as a G
            outputString.push(Mongol.ga);
            outputString.push(Mongol.fvs2);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.qaMediStem:
          case Menksoft.qaMediTooth:
            outputString.push(Mongol.qa);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.qa);
            break;
        }
        break;
    }
  }

  private handleGa(
    outputString: number[],
    currentChar: number,
    charAbove: number,
    charBelow: number,
  ): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.gaInitFvs1Stem:
          case Menksoft.gaInitFvs1Tooth:
            // treat the undotted masculine G as a Q
            outputString.push(Mongol.qa);
            break;
          case Menksoft.gaFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ga);
            break;
          case Menksoft.gaFinaFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ga);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.gaFinaFvs3:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ga);
            outputString.push(Mongol.fvs3);
            break;
          case Menksoft.gaMedi:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ga);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.gaMediFvs1Stem:
          case Menksoft.gaMediFvs1Tooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ga);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.gaMediFvs2Stem:
          case Menksoft.faMediFvs2Tooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ga);
            outputString.push(Mongol.fvs2);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.ga);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.gaInitFvs1Stem:
          case Menksoft.gaInitFvs1Tooth:
            // treat the undotted masculine G as a Q
            outputString.push(Mongol.qa);
            break;
          default:
            outputString.push(Mongol.ga);
            break;
        }
        break;
      case Location.medi:
        switch (currentChar) {
          case Menksoft.faMediFvs2Tooth:
          case Menksoft.gaMediFvs2Stem:
          case Menksoft.gaMediFvs2:
          case Menksoft.gaMediFvs2Ou:
            outputString.push(Mongol.ga);
            // If word contains masculine vowel and not surrounded by consonants
            if (
              this.isNotFeminineOrI(charBelow) &&
              this.inputWordContainsMasculineVowel() &&
              (this.isVowel(charAbove) || this.isVowel(charBelow))
            ) {
              outputString.push(Mongol.fvs2);
            }
            break;
          default:
            outputString.push(Mongol.ga);
            break;
        }
        break;
      case Location.fina: {
        outputString.push(Mongol.ga);
        const gender = genderOf(outputString);
        switch (currentChar) {
          case Menksoft.gaFinaFvs1:
            if (gender !== Gender.masculine) {
              outputString.push(Mongol.fvs1);
            }
            break;
          case Menksoft.gaFinaFvs2:
            if (gender === Gender.masculine) {
              outputString.push(Mongol.fvs2);
            }
            break;
          case Menksoft.gaFinaFvs3:
            outputString.push(Mongol.fvs3);
            break;
          case Menksoft.gaMedi:
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.gaMediFvs1Stem:
          case Menksoft.gaMediFvs1Tooth:
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.gaMediFvs2Stem:
          case Menksoft.faMediFvs2Tooth:
            outputString.push(Mongol.fvs2);
            outputString.push(Mongol.nirugu);
            break;
        }
        break;
      }
    }
  }

  private isNotFeminineOrI(char: number): boolean {
    return !Menksoft.isFeminineVowel(char) && !Menksoft.isI(char);
  }

  private inputWordContainsMasculineVowel(): boolean {
    for (let i = 0; i < this.inputWord.length; i++) {
      if (Menksoft.isMasculineVowel(this.inputWord[i] ?? 0)) {
        return true;
      }
    }
    return false;
  }

  private isVowel(character: number): boolean {
    return Menksoft.isVowel(character);
  }

  private handleMa(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.maFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ma);
            break;
          case Menksoft.maMediBp:
          case Menksoft.maMediStemLong:
          case Menksoft.maMediTooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ma);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.ma);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.maMediBp:
          case Menksoft.maMediStemLong:
          case Menksoft.maMediTooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ma);
            break;
          default:
            outputString.push(Mongol.ma);
            break;
        }
        break;
      case Location.medi:
        outputString.push(Mongol.ma);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.maMediBp:
          case Menksoft.maMediStemLong:
          case Menksoft.maMediTooth:
            outputString.push(Mongol.ma);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.ma);
            break;
        }
        break;
    }
  }

  private handleLa(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.laFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.la);
            break;
          case Menksoft.laMediBp:
          case Menksoft.laMediStemLong:
          case Menksoft.laMediTooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.la);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.la);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.laMediBp:
          case Menksoft.laMediStemLong:
          case Menksoft.laMediTooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.la);
            break;
          default:
            outputString.push(Mongol.la);
            break;
        }
        break;
      case Location.medi:
        outputString.push(Mongol.la);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.laMediBp:
          case Menksoft.laMediStemLong:
          case Menksoft.laMediTooth:
            outputString.push(Mongol.la);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.la);
            break;
        }
        break;
    }
  }

  private handleSa(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.saFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.sa);
            break;
          case Menksoft.saFinaFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.sa);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.saMediStem:
          case Menksoft.saMediTooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.sa);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.sa);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.saMediStem:
          case Menksoft.saMediTooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.sa);
            break;
          default:
            outputString.push(Mongol.sa);
            break;
        }
        break;
      case Location.medi:
        outputString.push(Mongol.sa);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.saMediStem:
          case Menksoft.saMediTooth:
            outputString.push(Mongol.sa);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.sa);
            break;
        }
        break;
    }
  }

  private handleSha(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.shaFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.sha);
            break;
          case Menksoft.shaMediStem:
          case Menksoft.shaMediTooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.sha);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.sha);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.shaMediStem:
          case Menksoft.shaMediTooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.sha);
            break;
          default:
            outputString.push(Mongol.sha);
            break;
        }
        break;
      case Location.medi:
        outputString.push(Mongol.sha);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.shaMediStem:
          case Menksoft.shaMediTooth:
            outputString.push(Mongol.sha);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.sha);
            break;
        }
        break;
    }
  }

  private handleTa(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.taFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ta);
            break;
          case Menksoft.taMedi:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ta);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.taMediFvs1Stem:
          case Menksoft.taMediFvs1Tooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ta);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.ta);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.taMedi:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ta);
            break;
          case Menksoft.taMediFvs1Stem:
          case Menksoft.taMediFvs1Tooth:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ta);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.ta);
            break;
        }
        break;
      case Location.medi:
        switch (currentChar) {
          case Menksoft.taMediFvs1Stem:
          case Menksoft.taMediFvs1Tooth:
            outputString.push(Mongol.ta);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.ta);
            break;
        }
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.taMedi:
            outputString.push(Mongol.ta);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.taMediFvs1Stem:
          case Menksoft.taMediFvs1Tooth:
            outputString.push(Mongol.ta);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.ta);
            break;
        }
        break;
    }
  }

  private handleDa(outputString: number[], currentChar: number, charBelow: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.daInitStem:
          case Menksoft.daInitTooth:
            // replace isolated DA that looks like TA with actual TA
            outputString.push(Mongol.ta);
            break;
          case Menksoft.daFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.da);
            break;
          case Menksoft.daFinaFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.da);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.daMedi:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.da);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.daMediFvs1:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.da);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.da);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.daMedi:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.da);
            break;
          case Menksoft.daInitFvs1:
          case Menksoft.daMediFvs1:
            outputString.push(Mongol.da);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.da);
            break;
        }
        break;
      case Location.medi:
        switch (currentChar) {
          case Menksoft.daInitFvs1:
          case Menksoft.daMediFvs1:
            outputString.push(Mongol.da);
            if (Menksoft.isConsonant(charBelow)) {
              outputString.push(Mongol.fvs1);
            }
            break;
          case Menksoft.daMedi:
            outputString.push(Mongol.da);
            if (Menksoft.isVowel(charBelow)) {
              outputString.push(Mongol.fvs1);
            }
            break;
          default:
            outputString.push(Mongol.da);
            break;
        }
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.daMedi:
            outputString.push(Mongol.da);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.daMediFvs1:
            outputString.push(Mongol.da);
            outputString.push(Mongol.fvs1);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.daFinaFvs1:
            outputString.push(Mongol.da);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.da);
            break;
        }
        break;
    }
  }

  private handleCha(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.chaFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.cha);
            break;
          default:
            outputString.push(Mongol.cha);
            break;
        }
        break;
      case Location.init:
        outputString.push(Mongol.cha);
        break;
      case Location.medi:
        outputString.push(Mongol.cha);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.chaMedi:
            outputString.push(Mongol.cha);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.cha);
            break;
        }
        break;
    }
  }

  private handleJa(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.jaFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ja);
            break;
          case Menksoft.jaMedi:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ja);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.jaMediMvs:
            // ignoring ancient form,
            // it looks like a const I so make it one
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.i);
            break;
          default:
            outputString.push(Mongol.ja);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.jaMedi:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ja);
            break;
          default:
            outputString.push(Mongol.ja);
            break;
        }
        break;
      case Location.medi:
        outputString.push(Mongol.ja);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.jaMedi:
            outputString.push(Mongol.ja);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.jaMediMvs:
            // ignoring ancient form,
            // it looks like a const I so make it one
            outputString.push(Mongol.i);
            break;
          default:
            outputString.push(Mongol.ja);
            break;
        }
        break;
    }
  }

  private handleYa(
    outputString: number[],
    currentChar: number,
    charAbove: number,
    charBelow: number,
  ): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.yaIsolFvs1:
            outputString.push(Mongol.ya);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.yaMediFvs2:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ya);
            outputString.push(Mongol.fvs2);
            outputString.push(Mongol.nirugu);
            break;
          case Menksoft.yaFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ya);
            break;
          default:
            outputString.push(Mongol.ya);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.yaInitFvs1:
            outputString.push(Mongol.ya);
            outputString.push(Mongol.fvs1);
            break;
          default:
            outputString.push(Mongol.ya);
            break;
        }
        break;
      case Location.medi:
        switch (currentChar) {
          case Menksoft.yaMediFvs1:
            if (Menksoft.isVowel(charAbove) && this.isLongToothI(charBelow)) {
              // Drop the Y. It isn't needed for diphthongs.
            } else {
              outputString.push(Mongol.ya);
              outputString.push(Mongol.fvs1);
            }
            break;
          default:
            outputString.push(Mongol.ya);
            break;
        }
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.yaMedi:
            outputString.push(Mongol.ya);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.ya);
            break;
        }
        break;
    }
  }

  private handleRa(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.raFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.ra);
            break;
          default:
            outputString.push(Mongol.ra);
            break;
        }
        break;
      case Location.init:
        outputString.push(Mongol.ra);
        break;
      case Location.medi:
        outputString.push(Mongol.ra);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.raMediStem:
          case Menksoft.raMediTooth:
            outputString.push(Mongol.ra);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.ra);
            break;
        }
        break;
    }
  }

  private handleWa(
    outputString: number[],
    currentChar: number,
    _charAbove: number,
    _charBelow: number,
  ): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.waFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.wa);
            break;
          case Menksoft.waFinaFvs1:
            // an isolate const WA looks like a const U so make it one
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.u);
            break;
          default:
            outputString.push(Mongol.wa);
            break;
        }
        break;
      case Location.init:
        outputString.push(Mongol.wa);
        break;
      case Location.medi:
        // We could replace W between two consonants with EE
        // if (Menksoft.isMenksoftConsonant(charAbove) &&
        //     Menksoft.isMenksoftConsonant(charBelow)) {
        //   outputString.push(Unicode.EE);
        // }
        outputString.push(Mongol.wa);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.waFinaFvs1:
            outputString.push(Mongol.wa);
            outputString.push(Mongol.fvs1);
            break;
          case Menksoft.waMedi:
            outputString.push(Mongol.wa);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.wa);
            break;
        }
        break;
    }
  }

  private handleFa(outputString: number[], currentChar: number): void {
    if (this.location === Location.isol && currentChar === Menksoft.faFina) {
      outputString.push(Mongol.nirugu);
    }
    outputString.push(Mongol.fa);
  }

  private handleKa(outputString: number[], currentChar: number): void {
    if (this.location === Location.isol && currentChar === Menksoft.kaFina) {
      outputString.push(Mongol.nirugu);
    }
    outputString.push(Mongol.ka);
  }

  private handleKha(outputString: number[], currentChar: number): void {
    if (this.location === Location.isol && currentChar === Menksoft.khaFina) {
      outputString.push(Mongol.nirugu);
    }
    outputString.push(Mongol.kha);
  }

  private handleTsa(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.tsaFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.tsa);
            break;
          default:
            outputString.push(Mongol.tsa);
            break;
        }
        break;
      case Location.init:
        outputString.push(Mongol.tsa);
        break;
      case Location.medi:
        outputString.push(Mongol.tsa);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.tsaMedi:
            outputString.push(Mongol.tsa);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.tsa);
            break;
        }
        break;
    }
  }

  private handleZa(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.zaFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.za);
            break;
          default:
            outputString.push(Mongol.za);
            break;
        }
        break;
      case Location.init:
        outputString.push(Mongol.za);
        break;
      case Location.medi:
        outputString.push(Mongol.za);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.zaMedi:
            outputString.push(Mongol.za);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.za);
            break;
        }
        break;
    }
  }

  private handleHaa(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.haaFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.haa);
            break;
          case Menksoft.haaMedi:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.haa);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.haa);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.haaMedi:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.haa);
            break;
          default:
            outputString.push(Mongol.haa);
            break;
        }
        break;
      case Location.medi:
        outputString.push(Mongol.haa);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.haaMedi:
            outputString.push(Mongol.haa);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.haa);
            break;
        }
        break;
    }
  }

  private handleZra(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.zraFina:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.zra);
            break;
          default:
            outputString.push(Mongol.zra);
            break;
        }
        break;
      case Location.init:
        outputString.push(Mongol.zra);
        break;
      case Location.medi:
        outputString.push(Mongol.zra);
        break;
      case Location.fina:
        switch (currentChar) {
          case Menksoft.zraMedi:
            outputString.push(Mongol.zra);
            outputString.push(Mongol.nirugu);
            break;
          default:
            outputString.push(Mongol.zra);
            break;
        }
        break;
    }
  }

  private handleLha(outputString: number[], currentChar: number): void {
    switch (this.location) {
      case Location.isol:
        switch (currentChar) {
          case Menksoft.lhaMedi:
          case Menksoft.lhaMediBp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.lha);
            break;
          default:
            outputString.push(Mongol.lha);
            break;
        }
        break;
      case Location.init:
        switch (currentChar) {
          case Menksoft.lhaMedi:
          case Menksoft.lhaMediBp:
            outputString.push(Mongol.nirugu);
            outputString.push(Mongol.lha);
            break;
          default:
            outputString.push(Mongol.lha);
            break;
        }
        break;
      default:
        outputString.push(Mongol.lha);
        break;
    }
  }

  private handleZhi(outputString: number[]): void {
    outputString.push(Mongol.zhi);
  }

  private handleChi(outputString: number[]): void {
    outputString.push(Mongol.chi);
  }

  private handleSpace(outputString: number[], currentChar: number, charBelow: number): void {
    if (currentChar === Menksoft.nonbreakingSpace && Menksoft.isLetter(charBelow)) {
      outputString.push(Mongol.mvs);
    } else {
      outputString.push(SPACE);
    }
  }

  private handlePunctuation(outputString: number[], currentChar: number): void {
    switch (currentChar) {
      case Menksoft.birga:
        outputString.push(Mongol.birga);
        break;
      case Menksoft.ellipsis:
        outputString.push(Mongol.ellipsis);
        break;
      case Menksoft.comma:
        outputString.push(Mongol.comma);
        break;
      case Menksoft.fullStop:
        outputString.push(Mongol.fullStop);
        break;
      case Menksoft.colon:
        outputString.push(Mongol.colon);
        break;
      case Menksoft.fourDots:
        outputString.push(Mongol.fourDots);
        break;
      case Menksoft.todoSoftHyphen:
        outputString.push(Mongol.todoSoftHyphen);
        break;
      case Menksoft.sibeSyllableBoundaryMarker:
        outputString.push(Mongol.sibeSyllableBoundaryMarker);
        break;
      case Menksoft.manchuComma:
        outputString.push(Mongol.manchuComma);
        break;
      case Menksoft.manchuFullStop:
        outputString.push(Mongol.manchuFullStop);
        break;
      case Menksoft.nirugu:
        outputString.push(Mongol.nirugu);
        break;
      case Menksoft.birgaWithOrnament:
        outputString.push(Mongol.birga, Mongol.fvs1);
        break;
      case Menksoft.rotatedBirga:
        outputString.push(Mongol.birga, Mongol.fvs2);
        break;
      case Menksoft.doubleBirgaWithOrnament:
        outputString.push(Mongol.birga, Mongol.fvs3);
        break;
      case Menksoft.tripleBirgaWithOrnament:
        outputString.push(Mongol.birga, Mongol.fvs4);
        break;
      case Menksoft.middleDot:
        outputString.push(Mongol.middleDot);
        break;
      case Menksoft.zero:
        outputString.push(Mongol.digitZero);
        break;
      case Menksoft.one:
        outputString.push(Mongol.digitOne);
        break;
      case Menksoft.two:
        outputString.push(Mongol.digitTwo);
        break;
      case Menksoft.three:
        outputString.push(Mongol.digitThree);
        break;
      case Menksoft.four:
        outputString.push(Mongol.digitFour);
        break;
      case Menksoft.five:
        outputString.push(Mongol.digitFive);
        break;
      case Menksoft.six:
        outputString.push(Mongol.digitSix);
        break;
      case Menksoft.seven:
        outputString.push(Mongol.digitSeven);
        break;
      case Menksoft.eight:
        outputString.push(Mongol.digitEight);
        break;
      case Menksoft.nine:
        outputString.push(Mongol.digitNine);
        break;
      case Menksoft.questionExclamation:
        outputString.push(Mongol.questionExclamation);
        break;
      case Menksoft.exclamationQuestion:
        outputString.push(Mongol.exclamationQuestion);
        break;
      case Menksoft.exclamation:
        outputString.push(Mongol.fullwidthExclamation);
        break;
      case Menksoft.question:
        outputString.push(Mongol.fullwidthQuestion);
        break;
      case Menksoft.semicolon:
        outputString.push(Mongol.fullwidthSemicolon);
        break;
      case Menksoft.leftParenthesis:
        outputString.push(Mongol.fullwidthLeftParenthesis);
        break;
      case Menksoft.rightParenthesis:
        outputString.push(Mongol.fullwidthRightParenthesis);
        break;
      case Menksoft.leftAngleBracket:
        outputString.push(Mongol.leftAngleBracket);
        break;
      case Menksoft.rightAngleBracket:
        outputString.push(Mongol.rightAngleBracket);
        break;
      case Menksoft.leftTortoiseShellBracket:
        outputString.push(Mongol.verticalLeftTortoiseShellBracket);
        break;
      case Menksoft.rightTortoiseShellBracket:
        outputString.push(Mongol.verticalRightTortoiseShellBracket);
        break;
      case Menksoft.leftDoubleAngleBracket:
        outputString.push(Mongol.leftDoubleAngleBracket);
        break;
      case Menksoft.rightDoubleAngleBracket:
        outputString.push(Mongol.rightDoubleAngleBracket);
        break;
      case Menksoft.leftWhiteCornerBracket:
        outputString.push(Mongol.verticalLeftWhiteCornerBracket);
        break;
      case Menksoft.rightWhiteCornerBracket:
        outputString.push(Mongol.verticalRightWhiteCornerBracket);
        break;
      case Menksoft.fullWidthComma:
        outputString.push(Mongol.verticalComma);
        break;
      case Menksoft.x:
        outputString.push(0x00d7); // FIXME using the multiplication sign?
        break;
      case Menksoft.referenceMark:
        outputString.push(Mongol.referenceMark);
        break;
      case Menksoft.enDash:
        outputString.push(Mongol.verticalEnDash);
        break;
      case Menksoft.emDash:
        outputString.push(Mongol.verticalEmDash);
        break;
      default:
        outputString.push(currentChar);
        break;
    }
  }

  private isMenksoftSpaceChar(character: number): boolean {
    return (
      character === SPACE ||
      character === Menksoft.nonbreakingSpace ||
      character === Menksoft.unknownSpace
    );
  }
}
