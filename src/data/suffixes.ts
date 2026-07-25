/**
 * Hudum suffix dictionary — the machine-readable form of docs/suffixes.md
 * (2026-07-25). Sources: Mongolian school grammar tables, UTN #57 v4
 * (2024-08-14), and the mongfontbuilder particle shaping registry — which
 * confirms entries but cannot refute absences (it only lists particles
 * needing special letter forms), so this curated list is authoritative.
 *
 * Sequences exclude the leading connector (MVS U+180E, legacy NNBSP U+202F).
 * ᠯᠤᠭ\u180Eᠠ carries a word-internal MVS, written as an escape per the
 * no-invisible-literals convention.
 */

export type SuffixCategory =
  | 'genitive'
  | 'accusative'
  | 'dative-locative'
  | 'ablative'
  | 'instrumental'
  | 'comitative'
  | 'reflexive'
  | 'plural'
  | 'fused'
  | 'particle';

export interface SuffixEntry {
  /** Letter sequence after the connector; may contain internal U+180E. */
  sequence: string;
  translit: string;
  /** Cyrillic equivalent; '?' where the gloss is unconfirmed. */
  cyrillic: string;
  category: SuffixCategory;
}

export const suffixes: readonly SuffixEntry[] = [
  // Genitive — харьяалахын тийн ялгал
  { sequence: 'ᠶᠢᠨ', translit: 'yin', cyrillic: '-ийн/-ын', category: 'genitive' },
  { sequence: 'ᠤᠨ', translit: 'un', cyrillic: '-ын', category: 'genitive' },
  { sequence: 'ᠦᠨ', translit: 'ün', cyrillic: '-ийн', category: 'genitive' },
  { sequence: 'ᠤ', translit: 'u', cyrillic: '-ы', category: 'genitive' },
  { sequence: 'ᠦ', translit: 'ü', cyrillic: '-ий', category: 'genitive' },
  // Accusative — заахын тийн ялгал
  { sequence: 'ᠶᠢ', translit: 'yi', cyrillic: '-г', category: 'accusative' },
  { sequence: 'ᠢ', translit: 'i', cyrillic: '-ыг/-ийг', category: 'accusative' },
  // Dative-locative — өгөх оршихын тийн ялгал
  { sequence: 'ᠳᠤ', translit: 'du', cyrillic: '-д', category: 'dative-locative' },
  { sequence: 'ᠳᠦ', translit: 'dü', cyrillic: '-д', category: 'dative-locative' },
  { sequence: 'ᠳᠤᠷ', translit: 'dur', cyrillic: '-д', category: 'dative-locative' },
  { sequence: 'ᠳᠦᠷ', translit: 'dür', cyrillic: '-д', category: 'dative-locative' },
  { sequence: 'ᠲᠤ', translit: 'tu', cyrillic: '-т', category: 'dative-locative' },
  { sequence: 'ᠲᠦ', translit: 'tü', cyrillic: '-т', category: 'dative-locative' },
  { sequence: 'ᠲᠤᠷ', translit: 'tur', cyrillic: '-т', category: 'dative-locative' },
  { sequence: 'ᠲᠦᠷ', translit: 'tür', cyrillic: '-т', category: 'dative-locative' },
  // Ablative — гарахын тийн ялгал
  { sequence: 'ᠠᠴᠠ', translit: 'acha', cyrillic: '-аас/-оос', category: 'ablative' },
  { sequence: 'ᠡᠴᠡ', translit: 'eche', cyrillic: '-ээс/-өөс', category: 'ablative' },
  // Instrumental — үйлдэхийн тийн ялгал
  { sequence: 'ᠪᠠᠷ', translit: 'bar', cyrillic: '-аар/-оор', category: 'instrumental' },
  { sequence: 'ᠪᠡᠷ', translit: 'ber', cyrillic: '-ээр/-өөр', category: 'instrumental' },
  { sequence: 'ᠢᠶᠠᠷ', translit: 'iyar', cyrillic: '-аар/-оор', category: 'instrumental' },
  { sequence: 'ᠢᠶᠡᠷ', translit: 'iyer', cyrillic: '-ээр/-өөр', category: 'instrumental' },
  // Comitative — хамтрахын тийн ялгал
  { sequence: 'ᠲᠠᠢ', translit: 'tai', cyrillic: '-тай', category: 'comitative' },
  { sequence: 'ᠲᠡᠢ', translit: 'tei', cyrillic: '-тэй', category: 'comitative' },
  { sequence: 'ᠯᠤᠭ\u180Eᠠ', translit: 'luγ-a', cyrillic: 'лугаа', category: 'comitative' },
  { sequence: 'ᠯᠦᠭᠡ', translit: 'lüge', cyrillic: 'лүгээ', category: 'comitative' },
  // Reflexive-possessive — хамаатуулах нөхцөл
  { sequence: 'ᠪᠠᠨ', translit: 'ban', cyrillic: '-аа/-оо', category: 'reflexive' },
  { sequence: 'ᠪᠡᠨ', translit: 'ben', cyrillic: '-ээ/-өө', category: 'reflexive' },
  { sequence: 'ᠢᠶᠠᠨ', translit: 'iyan', cyrillic: '-аа/-оо', category: 'reflexive' },
  { sequence: 'ᠢᠶᠡᠨ', translit: 'iyen', cyrillic: '-ээ/-өө', category: 'reflexive' },
  // Plural — олон тооны дагавар
  { sequence: 'ᠤᠳ', translit: 'ud', cyrillic: '-ууд', category: 'plural' },
  { sequence: 'ᠦᠳ', translit: 'üd', cyrillic: '-үүд', category: 'plural' },
  { sequence: 'ᠨᠤᠭᠤᠳ', translit: 'nuγud', cyrillic: '-ууд', category: 'plural' },
  { sequence: 'ᠨᠦᠭᠦᠳ', translit: 'nügüd', cyrillic: '-үүд', category: 'plural' },
  { sequence: 'ᠨᠠᠷ', translit: 'nar', cyrillic: 'нар', category: 'plural' },
  { sequence: 'ᠨᠡᠷ', translit: 'ner', cyrillic: 'нэр', category: 'plural' },
  // Fused case + reflexive / clitic combinations
  { sequence: 'ᠳᠠᠭᠠᠨ', translit: 'daγan', cyrillic: '-даа/-доо', category: 'fused' },
  { sequence: 'ᠳᠡᠭᠡᠨ', translit: 'degen', cyrillic: '-дээ/-дөө', category: 'fused' },
  { sequence: 'ᠲᠠᠭᠠᠨ', translit: 'taγan', cyrillic: '-таа/-тоо', category: 'fused' },
  { sequence: 'ᠲᠡᠭᠡᠨ', translit: 'tegen', cyrillic: '-тээ/-төө', category: 'fused' },
  { sequence: 'ᠠᠴᠠᠭᠠᠨ', translit: 'achaγan', cyrillic: '-аасаа', category: 'fused' },
  { sequence: 'ᠡᠴᠡᠭᠡᠨ', translit: 'echegen', cyrillic: '-ээсээ', category: 'fused' },
  { sequence: 'ᠳᠤᠨᠢ', translit: 'duni', cyrillic: '-д нь', category: 'fused' },
  { sequence: 'ᠳᠦᠨᠢ', translit: 'düni', cyrillic: '-д нь', category: 'fused' },
  { sequence: 'ᠲᠤᠨᠢ', translit: 'tuni', cyrillic: '-т нь', category: 'fused' },
  { sequence: 'ᠲᠦᠨᠢ', translit: 'tüni', cyrillic: '-т нь', category: 'fused' },
  { sequence: 'ᠳᠠᠬᠢ', translit: 'daqi', cyrillic: '-дахь', category: 'fused' },
  { sequence: 'ᠳᠡᠬᠢ', translit: 'deqi', cyrillic: '-дэхь', category: 'fused' },
  { sequence: 'ᠳᠤᠭᠠᠷ', translit: 'duγar', cyrillic: '-дугаар', category: 'fused' },
  { sequence: 'ᠳᠦᠭᠡᠷ', translit: 'düger', cyrillic: '-дүгээр', category: 'fused' },
  // Possessive clitics — written detached in standard orthography; absent
  // from the shaping registry (default shaping), surfaced by corpus-linting
  // gege.mn (2026-07-25).
  { sequence: 'ᠨᠢ', translit: 'ni', cyrillic: 'нь', category: 'particle' },
  { sequence: 'ᠮᠢᠨᠢ', translit: 'mini', cyrillic: 'минь', category: 'particle' },
  { sequence: 'ᠴᠢᠨᠢ', translit: 'chini', cyrillic: 'чинь', category: 'particle' },
  // Other MVS-joined particles from the UTN #57 registry
  { sequence: 'ᠴᠤ', translit: 'chu', cyrillic: 'ч', category: 'particle' },
  { sequence: 'ᠴᠦ', translit: 'chü', cyrillic: 'ч', category: 'particle' },
  { sequence: 'ᠶᠦᠮ', translit: 'yüm', cyrillic: 'юм', category: 'particle' },
  { sequence: 'ᠶᠦᠮᠰᠡᠨ', translit: 'yümsen', cyrillic: 'юмсан', category: 'particle' },
  { sequence: 'ᠳᠠ', translit: 'da', cyrillic: '-да', category: 'particle' },
  { sequence: 'ᠳᠡ', translit: 'de', cyrillic: '-дэ', category: 'particle' },
  { sequence: 'ᠳᠠᠭ', translit: 'dag', cyrillic: '-даг?', category: 'particle' },
  { sequence: 'ᠳᠡᠭ', translit: 'deg', cyrillic: '-дэг?', category: 'particle' },
  { sequence: 'ᠶᠦᠭᠡᠨ', translit: 'yügen', cyrillic: '?', category: 'particle' },
  { sequence: 'ᠨᠦᠭᠡᠨ', translit: 'nügen', cyrillic: '?', category: 'particle' },
  { sequence: 'ᠬᠦ', translit: 'hü', cyrillic: 'кү', category: 'particle' },
];
