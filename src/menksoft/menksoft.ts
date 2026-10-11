export const menksoftStart = 0xe234;
export const menksoftEnd = 0xe34f;

// Private Use Area glyph values
export const birga = 0xe234;
export const ellipsis = 0xe235;
export const comma = 0xe236;
export const fullStop = 0xe237;
export const colon = 0xe238;
export const fourDots = 0xe239;
export const todoSoftHyphen = 0xe23a;
export const sibeSyllableBoundaryMarker = 0xe23b;
export const manchuComma = 0xe23c;
export const manchuFullStop = 0xe23d;
export const nirugu = 0xe23e;
export const birgaWithOrnament = 0xe23f;
export const rotatedBirga = 0xe240;
export const doubleBirgaWithOrnament = 0xe241;
export const tripleBirgaWithOrnament = 0xe242;
export const middleDot = 0xe243;
export const zero = 0xe244;
export const one = 0xe245;
export const two = 0xe246;
export const three = 0xe247;
export const four = 0xe248;
export const five = 0xe249;
export const six = 0xe24a;
export const seven = 0xe24b;
export const eight = 0xe24c;
export const nine = 0xe24d;
export const questionExclamation = 0xe24e;
export const exclamationQuestion = 0xe24f;
export const exclamation = 0xe250;
export const question = 0xe251;
export const semicolon = 0xe252;
export const leftParenthesis = 0xe253;
export const rightParenthesis = 0xe254;
export const leftAngleBracket = 0xe255;
export const rightAngleBracket = 0xe256;
export const leftTortoiseShellBracket = 0xe257;
export const rightTortoiseShellBracket = 0xe258;
export const leftDoubleAngleBracket = 0xe259;
export const rightDoubleAngleBracket = 0xe25a;
export const leftWhiteCornerBracket = 0xe25b;
export const rightWhiteCornerBracket = 0xe25c;
export const fullWidthComma = 0xe25d;
export const x = 0xe25e;
export const referenceMark = 0xe25f; // 0x203b
export const enDash = 0xe260; // TODO is that what this is?
export const emDash = 0xe261; // TODO is that what this is?
export const unknownSpace = 0xe262; // TODO what is this?
export const nonbreakingSpace = 0xe263;

// These are in the order of the China National Standards committee 2023
// document for Mongolian presentation characters. This should be the same
// Unicode encoding as the Baiti font.

// Bp = looks better after B, P (and other rounded like Q, G, F, K, KH)
// mvs = final glyph variant for MVS
// tooth = the ending of this character matches a following character that slants left (for example, a tooth)
// stem = the ending of this character matches a following character that starts with a vertical stem
// round = the ending of this character matches a round following character (feminine QG)
export const aStart = 0xe264;
export const aIsol = 0xe264; // also FVS3
export const aIsolFvs1 = 0xe265;
export const aIsolFvs2 = 0xe26a;
export const aInit = 0xe266; // also FVS2
export const aInitFvs1 = 0xe267;
export const aMedi = 0xe26c;
export const aMediBp = 0xe26d;
export const aMediFvs1 = 0xe26e;
export const aMediUnknown = 0xe26f;
export const aFina = 0xe268; // also FVS2
export const aFinaBp = 0xe26b; // const A following BPKF
export const aFinaFvs1 = 0xe269;
export const aFinaMvs = 0xe26a; // gv for MVS + A

export const eStart = 0xe270;
export const eIsol = 0xe270;
export const eIsolFvs1 = 0xe274;
export const eInit = 0xe271;
export const eInitFvs1 = 0xe272;
export const eMedi = 0xe276;
export const eMediBp = 0xe277;
export const eMediUnknown = 0xe278;
export const eFina = 0xe273;
export const eFinaBp = 0xe275; // const E following BPKF
export const eFinaFvs1 = 0xe269; // no E glyph so using A
export const eFinaMvs = 0xe274; // gv for MVS + E

export const iStart = 0xe279;
export const iIsol = 0xe279;
export const iIsolFvs1 = 0xe282; // suffix
export const iInit = 0xe27a;
export const iInitFvs1 = 0xe280; // suffix
export const iMedi = 0xe27e;
export const iMediBp = 0xe27f;
export const iMediFvs1 = 0xe27d; // short then long tooth
export const iMediFvs2 = 0xe281; // double long tooth
export const iFina = 0xe27b;
export const iFinaBp = 0xe27c;

export const oStart = 0xe283;
export const oIsol = 0xe283;
export const oInit = 0xe284;
export const oMedi = 0xe289;
export const oMediBp = 0xe28a;
export const oMediFvs1 = 0xe288;
export const oFina = 0xe285; // swirl
export const oFinaFvs1 = 0xe286; // gedes
export const oFinaFvs1Bp = 0xe287;

export const uStart = 0xe28b;
export const uIsol = 0xe28b;
export const uIsolFvs1 = 0xe28d; // suffix
export const uInit = 0xe28c;
export const uInitFvs1 = 0xe292; // suffix
export const uMedi = 0xe291;
export const uMediBp = 0xe292;
export const uMediFvs1 = 0xe290;
export const uFina = 0xe28d;
export const uFinaFvs1 = 0xe28e;
export const uFinaFvs1Bp = 0xe28f;

export const oeStart = 0xe293;
export const oeIsol = 0xe293;
export const oeIsolFvs1 = 0xe294;
export const oeInit = 0xe295;
export const oeMedi = 0xe29e;
export const oeMediBp = 0xe29f;
export const oeMediFvs1 = 0xe29c;
export const oeMediFvs1Bp = 0xe29d;
export const oeMediFvs2 = 0xe29b;
export const oeFina = 0xe296;
export const oeFinaBp = 0xe29a;
export const oeFinaFvs1 = 0xe297;
export const oeFinaFvs1Bp = 0xe298;
export const oeFinaFvs2 = 0xe299;
export const oeFinaFvs2Bp = 0xe29a;

export const ueStart = 0xe2a0;
export const ueIsol = 0xe2a0;
export const ueIsolFvs1 = 0xe2a1;
export const ueIsolFvs2 = 0xe2a3;
export const ueInit = 0xe2a2;
export const ueInitFvs1 = 0xe2ac;
export const ueMedi = 0xe2ab; // no tooth
export const ueMediBp = 0xe2ac; // no tooth
export const ueMediFvs1 = 0xe2a9; // tooth
export const ueMediFvs1Bp = 0xe2aa; // tooth
// short tooth first with later long tooth
export const ueMediFvs2 = 0xe2a8;
export const ueFina = 0xe2a3; // swirl
export const ueFinaBp = 0xe2a7; // no tooth
export const ueFinaFvs1 = 0xe2a4; // tooth
export const ueFinaFvs1Bp = 0xe2a5; // tooth
export const ueFinaFvs2 = 0xe2a6; // gedes
export const ueFinaFvs2Bp = 0xe2a7; // no tooth

export const eeStart = 0xe2ad;
export const eeIsol = 0xe2ad;
export const eeInit = 0xe2ae;
export const eeMedi = 0xe2b0;
export const eeFina = 0xe2af;

export const naStart = 0xe2b1;
export const naIsol = 0xe2b3;
export const naIsolFvs1 = 0xe2b4;
export const naInitTooth = 0xe2b1;
export const naInitStem = 0xe2b3;
export const naInitFvs1Tooth = 0xe2b2;
export const naInitFvs1Stem = 0xe2b4;
export const naMediTooth = 0xe2b8; // undotted
export const naMediStem = 0xe2ba; // undotted
export const naMediFvs1Tooth = 0xe2b7; // dotted
export const naMediFvs1Stem = 0xe2b9; // dotted
export const naMediFvs1Mvs = 0xe2b6;
export const naMediFvs2Mvs = 0xe2b5;
export const naMediNg = 0xe2c0;
export const naMediFvs1Ng = 0xe2bf;
export const naFina = 0xe2b5;
export const naFinaFvs1 = 0xe2b6;

export const angStart = 0xe2bb;
export const angIsol = 0xe2bc;
export const angInitTooth = 0xe2bc;
export const angInitRound = 0xe2bd;
export const angInitStem = 0xe2be;
export const angMediTooth = 0xe2bc; // good for following tooth
// good for following round letter like B P H K
export const angMediRound = 0xe2bd;
// good for following stem letter like J CH R
export const angMediStem = 0xe2be;
export const angFina = 0xe2bb;
export const angEnd = 0xe2be;

export const baStart = 0xe2c1;
export const baIsol = 0xe2c1;
export const baInitTooth = 0xe2c1;
export const baInitOu = 0xe2c2;
export const baInitStem = 0xe2c7; // using medial stem
export const baMediTooth = 0xe2c5;
export const baMediOu = 0xe2c6;
export const baMediStem = 0xe2c7;
export const baFina = 0xe2c3;
export const baFinaFvs1 = 0xe2c4;

export const paStart = 0xe2c8;
export const paIsol = 0xe2c8;
export const paInitTooth = 0xe2c8;
export const paInitOu = 0xe2c9;
export const paInitStem = 0xe2cd; // using medial stem
export const paMediTooth = 0xe2cb;
export const paMediOu = 0xe2cc;
export const paMediStem = 0xe2cd;
export const paFina = 0xe2ca;

export const qaStart = 0xe2ce;
export const qaIsol = 0xe2d2;
export const qaIsolFvs1 = 0xe2d3;
export const qaIsolFvs2 = 0xe2d0;
export const qaIsolFvs4 = 0xe2d1; // dotted feminine
export const qaInitTooth = 0xe2ce;
export const qaInitStem = 0xe2d2;
export const qaInitFvs1Tooth = 0xe2cf; // dotted masculine
export const qaInitFvs1Stem = 0xe2d3; // dotted masculine
export const qaInitFvs2 = 0xe2d0; // feminine
export const qaInitFvs2Ou = 0xe2d4; // feminine
export const qaInitFvs4 = 0xe2d1; // dotted feminine
export const qaInitFvs4Ou = 0xe2d5; // dotted feminine
export const qaMediTooth = 0xe2d8; // two teeth
export const qaMediStem = 0xe2dc; // two teeth
export const qaMediFvs1 = 0xe2d9; // dotted teeth
export const qaMediFvs2 = 0xe2da; // feminine
export const qaMediFvs2Ou = 0xe2dd; // feminine
export const qaMediFvs2Cons = 0xe2df; // feminine before consonant
export const qaMediFvs4 = 0xe2db; // dotted feminine
export const qaMediFvs4Ou = 0xe2de;
// dotted feminine before consonant
export const qaMediFvs4Cons = 0xe2e0;
export const qaMediMvs = 0xe2d6;
export const qaMediFvs1Mvs = 0xe2d7; // dotted
export const qaFina = 0xe2d6;
export const qaFinaFvs1 = 0xe2d7; // dotted

export const gaStart = 0xe2e1;
export const gaIsol = 0xe2e4;
export const gaIsolFvs1 = 0xe2e5;
export const gaIsolFvs2 = 0xe2e3; // feminine
export const gaIsolFvs4 = 0xe2d1; // dotted feminine (using QA glyph)
export const gaInitTooth = 0xe2e1; // dotted
export const gaInitStem = 0xe2e4; // dotted
export const gaInitFvs1Tooth = 0xe2e2; // non-dotted masculine
export const gaInitFvs1Stem = 0xe2e5; // non-dotted masculine
export const gaInitFvs2 = 0xe2e3; // feminine
export const gaInitFvs2Ou = 0xe2e6; // feminine
export const gaInitFvs4 = 0xe2d1; // dotted feminine (using QA glyph)
export const gaInitFvs4Ou = 0xe2d5; // dotted feminine (using QA glyph)
export const gaMedi = 0xe2ee; // two teeth no dots
export const gaMediFvs1Tooth = 0xe2ea; // dotted two teeth
export const gaMediFvs1Stem = 0xe2ec; // dotted two teeth
export const gaMediFvs2 = 0xe2eb; // feminine
export const gaMediFvs2Ou = 0xe2ed; // feminine
export const faMediFvs2Tooth = 0xe2ef; // feminine before consonant
export const gaMediFvs2Stem = 0xe2f0; // feminine before consonant
export const gaMediFvs4 = 0xe2db; // dotted feminine (using QA glyph)
export const gaMediFvs4Ou = 0xe2de; // dotted feminine (using QA glyph)
// dotted feminine before consonant (using QA glyph)
export const gaMediFvs4Cons = 0xe2e0;
export const gaMediFvs3Mvs = 0xe2e9;
export const gaMediFvs1Mvs = 0xe2d6; // (using QA glyph)
export const gaFina = 0xe2e8; // feminine
export const gaFinaFvs1 = 0xe2e7; // masculine
export const gaFinaFvs2 = 0xe2e8; // feminine
export const gaFinaFvs3 = 0xe2e9; // dotted masculine

export const maStart = 0xe2f1;
export const maIsol = 0xe2f2;
export const maInitTooth = 0xe2f1;
export const maInitStemLong = 0xe2f2;
export const maMediTooth = 0xe2f4;
// long stem GV, use this if M or L follows
export const maMediStemLong = 0xe2f5;
// use this if following a B, P, H, K, etc.
export const maMediBp = 0xe2f6;
export const maMediMvs = 0xe2f3;
export const maFina = 0xe2f3;

export const laStart = 0xe2f7;
export const laIsol = 0xe2f8;
export const laInitTooth = 0xe2f7;
export const laInitStemLong = 0xe2f8;
export const laMediTooth = 0xe2fa;
export const laMediStemLong = 0xe2fb; // use this if M or L follows
// use this if following a B, P, H, K, etc.
export const laMediBp = 0xe2fc;
export const laMediMvs = 0xe2f9;
export const laFina = 0xe2f9;

export const saStart = 0xe2fd;
export const saIsol = 0xe2fe;
export const saInitTooth = 0xe2fd;
export const saInitStem = 0xe2fe;
export const saMediTooth = 0xe301;
export const saMediStem = 0xe302;
export const saMediMvs = 0xe2ff;
export const saMediFvs1Mvs = 0xe300;
export const saFina = 0xe2ff;
export const saFinaFvs1 = 0xe300;

export const shaStart = 0xe303;
export const shaIsol = 0xe304;
export const shaIsolFvs1 = 0xe2fe; // using SA glyph
export const shaInitTooth = 0xe303;
export const shaInitStem = 0xe304;
export const shaInitFvs1Tooth = 0xe2fd; // using SA glyph
export const shaInitFvs1Stem = 0xe2fe; // using SA glyph
export const shaMediTooth = 0xe306;
export const shaMediStem = 0xe307;
export const shaMediFvs1Tooth = 0xe301; // using SA glyph
export const shaMediFvs1Stem = 0xe302; // using SA glyph
export const shaMediMvs = 0xe305;
export const shaFina = 0xe305;

export const taStart = 0xe308;
export const taIsol = 0xe309;
export const taInitTooth = 0xe308;
export const taInitStem = 0xe309;
export const taMedi = 0xe30b;
export const taMediFvs1Tooth = 0xe30c;
export const taMediFvs1Stem = 0xe30d;
export const taFina = 0xe30a;

export const daStart = 0xe30e;
export const daIsol = 0xe310;
export const daIsolFvs1 = 0xe30f;
export const daInitTooth = 0xe30e;
export const daInitStem = 0xe30f;
export const daInitFvs1 = 0xe310; // left arm with loop
export const daMedi = 0xe314;
export const daMediFvs1 = 0xe313;
export const daFina = 0xe311;
export const daFinaFvs1 = 0xe312;

export const chaStart = 0xe315;
export const chaIsol = 0xe315;
export const chaInit = 0xe315;
export const chaMedi = 0xe317;
export const chaFina = 0xe316;

export const jaStart = 0xe318;
export const jaIsol = 0xe318;
export const jaIsolFvs1 = 0xe31c;
export const jaInitTooth = 0xe319;
export const jaInitStem = 0xe31a;
export const jaMedi = 0xe31d;
export const jaMediMvs = 0xe31c;
export const jaFina = 0xe31b;
export const jaFinaFvs1 = 0xe31c;

export const yaStart = 0xe31e;
export const yaIsol = 0xe31e; // hooked
export const yaIsolFvs1 = 0xe321; // straight
export const yaInit = 0xe31e; // hooked
export const yaInitFvs1 = 0xe321; // straight
export const yaMedi = 0xe320; // hooked
export const yaMediFvs1 = 0xe321; // straight
export const yaMediFvs2 = 0xe281; // double long tooth (using I glyph)
export const yaMediMvs = 0xe31f;
export const yaFina = 0xe31f;

export const raStart = 0xe322;
export const raIsol = 0xe322;
export const raInitTooth = 0xe323;
export const raInitStem = 0xe322;
export const raMediTooth = 0xe327;
export const raMediStem = 0xe326;
export const raMediMvs = 0xe325;
export const raFina = 0xe325;

export const waStart = 0xe329;
export const waIsol = 0xe329;
export const waInit = 0xe329;
export const waMedi = 0xe32c;
export const waMediFvs1 = 0xe286; // (using O glyph)
export const waMediMvs = 0xe32b;
export const waFina = 0xe32a;
export const waFinaFvs1 = 0xe32b;

export const faStart = 0xe32d;
export const faIsol = 0xe32d;
export const faInitTooth = 0xe32d;
export const faInitOu = 0xe32e;
export const faInitStem = 0xe332; // using medial stem
export const faMediTooth = 0xe330;
export const faMediOu = 0xe331;
export const faMediStem = 0xe332;
export const faFina = 0xe32f;

export const kaStart = 0xe333;
export const kaIsol = 0xe333;
export const kaInit = 0xe333;
export const kaInitOu = 0xe334;
export const kaMediTooth = 0xe336;
export const kaMediOu = 0xe337;
export const kaMediStem = 0xe338;
export const kaFina = 0xe335;

export const khaStart = 0xe339;
export const khaIsol = 0xe339;
export const initKha = 0xe339;
export const khaInitOu = 0xe33a;
export const khaMediTooth = 0xe33c;
export const khaMediOu = 0xe33d;
export const khaMediStem = 0xe33e;
export const khaFina = 0xe33b;

export const tsaStart = 0xe33f;
export const tsaIsol = 0xe33f;
export const tsaInit = 0xe33f;
export const tsaMedi = 0xe341;
export const tsaFina = 0xe340;

export const zaStart = 0xe342;
export const zaIsol = 0xe342;
export const zaInit = 0xe342;
export const zaMedi = 0xe344;
export const zaFina = 0xe343;

export const haaStart = 0xe345;
export const haaIsol = 0xe345;
export const haaInit = 0xe345;
export const haaMedi = 0xe347;
export const haaFina = 0xe346;

export const zraStart = 0xe348;
export const zraIsol = 0xe348;
export const zraInit = 0xe348;
export const zraMedi = 0xe349;
export const zraFina = 0xe34a;

export const lhaStart = 0xe34b;
export const lhaIsol = 0xe34b;
export const lhaInit = 0xe34b;
export const lhaMedi = 0xe34c;
export const lhaMediBp = 0xe34d;
export const lhaFina = 0xe34c;
export const lhaFinaBp = 0xe34d;

export const zhiStart = 0xe34e;
export const zhiIsol = 0xe34e;
export const zhiInit = 0xe34e;
export const zhiMedi = 0xe34e;
export const zhiFina = 0xe34e;

export const chiStart = 0xe34f;
export const chiIsol = 0xe34f;
export const chiInit = 0xe34f;
export const chiMedi = 0xe34f;
export const chiFina = 0xe34f;

export function isMenksoft(codeUnit: number): boolean {
  return codeUnit >= menksoftStart && codeUnit <= menksoftEnd;
}

export function isSpace(codeUnit: number): boolean {
  return codeUnit === nonbreakingSpace || codeUnit === unknownSpace;
}

export function isLetter(character: number): boolean {
  return character >= aStart && character <= menksoftEnd;
}

export function isConsonant(character: number): boolean {
  return character >= naStart && character <= chiFina;
}

export function isVowel(character: number): boolean {
  return character >= aStart && character < naStart;
}

export function isMasculineVowel(character: number): boolean {
  return (
    (character >= aStart && character < eStart) || (character >= oStart && character < oeStart)
  );
}

export function isFeminineVowel(character: number): boolean {
  return (
    (character >= eStart && character < iStart) || (character >= oeStart && character < naStart)
  );
}

export function isI(character: number): boolean {
  return character >= iStart && character < oStart;
}

export function isInitialIsolateGlyph(character: number): boolean {
  if (character === 0) return false;
  return (
    character === aIsol ||
    character === aIsolFvs1 ||
    character === aInit ||
    character === aInitFvs1 ||
    character === eIsol ||
    character === eInit ||
    character === eInitFvs1 ||
    character === iIsol ||
    character === iIsolFvs1 ||
    character === iInit ||
    character === oInit ||
    character === oIsol ||
    character === uIsol ||
    character === uStart ||
    character === oeIsol ||
    character === oeInit ||
    character === oeIsolFvs1 ||
    character === ueInit ||
    character === ueStart ||
    character === ueIsolFvs1 ||
    character === eeIsol ||
    character === eeInit ||
    character === naInitStem ||
    character === naInitTooth ||
    character === naInitFvs1Stem ||
    character === naInitFvs1Tooth ||
    character === baInitTooth ||
    character === baInitOu ||
    character === baInitStem ||
    character === paInitTooth ||
    character === paInitOu ||
    character === paInitStem ||
    character === qaInitFvs2 ||
    character === qaInitFvs2Ou ||
    character === qaInitFvs4 ||
    character === qaInitFvs4Ou ||
    character === qaInitFvs1Stem ||
    character === qaInitFvs1Tooth ||
    character === qaInitStem ||
    character === qaInitTooth ||
    character === gaInitFvs2 ||
    character === gaInitFvs2Ou ||
    character === gaInitFvs1Stem ||
    character === gaInitFvs1Tooth ||
    character === gaInitStem ||
    character === gaInitTooth ||
    character === maInitTooth ||
    character === maInitStemLong ||
    character === laInitTooth ||
    character === laInitStemLong ||
    character === saInitStem ||
    character === saInitTooth ||
    character === shaInitStem ||
    character === shaInitTooth ||
    character === taInitStem ||
    character === taInitTooth ||
    character === daInitFvs1 ||
    character === daInitStem ||
    character === daInitTooth ||
    character === chaInit ||
    character === jaInitStem ||
    character === jaInitTooth ||
    character === yaInit ||
    character === yaInitFvs1 ||
    character === raInitStem ||
    character === raInitTooth ||
    character === waInit ||
    character === faInitTooth ||
    character === faInitOu ||
    character === faInitStem ||
    character === kaInit ||
    character === kaInitOu ||
    character === initKha ||
    character === khaInitOu ||
    character === tsaInit ||
    character === zaInit ||
    character === haaInit ||
    character === zraInit ||
    character === lhaInit
  );
}

export function isFinalIsolateGlyph(character: number): boolean {
  if (character === 0) return false;
  return (
    character === aIsol ||
    character === aIsolFvs1 ||
    character === aFina ||
    character === aFinaBp ||
    character === aFinaFvs1 ||
    character === aFinaMvs ||
    character === eIsol ||
    character === eFina ||
    character === eFinaBp ||
    character === eFinaMvs ||
    character === iIsol ||
    character === iIsolFvs1 ||
    character === iFina ||
    character === iFinaBp ||
    character === oIsol ||
    character === oFina ||
    character === oFinaFvs1 ||
    character === uIsol ||
    character === uFina ||
    character === uFinaFvs1Bp ||
    character === uFinaFvs1 ||
    character === oeIsol ||
    character === oeIsolFvs1 ||
    character === oeFina ||
    character === oeFinaBp ||
    character === oeFinaFvs1 ||
    character === oeFinaFvs1Bp ||
    character === oeFinaFvs2 ||
    character === ueIsol ||
    character === ueIsolFvs1 ||
    character === ueFina ||
    character === ueFinaBp ||
    character === ueFinaFvs1 ||
    character === ueFinaFvs1Bp ||
    character === ueFinaFvs2 ||
    character === eeIsol ||
    character === eeFina ||
    character === naFina ||
    character === angFina ||
    character === baFina ||
    character === baFinaFvs1 ||
    character === paFina ||
    character === qaFina ||
    character === gaFina ||
    character === gaFinaFvs2 ||
    character === maFina ||
    character === laFina ||
    character === saFina ||
    character === saFinaFvs1 ||
    character === shaFina ||
    character === taFina ||
    character === daFina ||
    character === daFinaFvs1 ||
    character === chaFina ||
    character === jaFina ||
    character === yaFina ||
    character === raFina ||
    character === waFina ||
    character === waFinaFvs1 ||
    character === faFina ||
    character === kaFina ||
    character === khaFina ||
    character === tsaFina ||
    character === zaFina ||
    character === haaFina ||
    character === zraFina
  );
}

export function isAng(currentChar: number): boolean {
  return currentChar >= angStart && currentChar <= angEnd;
}
