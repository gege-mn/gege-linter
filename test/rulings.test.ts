/**
 * Reader rulings — the only ground truth this project has.
 *
 * Every case here was drawn at random from 31,320 words + 4,000 sentences of
 * real, unrepaired third-party bichig (`scripts/build-spotcheck.mjs`), ruled on
 * by a bichig reader in a rendered page, and pasted back. A confirmed verdict
 * becomes an assertion; an open one becomes `it.todo` with the correct answer
 * written down, so nobody later has to guess what "right" was.
 *
 * Do not re-litigate these. If a rule change breaks one, the change is wrong
 * until the reader says otherwise.
 *
 * Session: seed 161294890, 2026-07-27. 24 of 28 items ruled.
 *
 * Samples are transcribed with `\uXXXX` for every invisible code point, and
 * were emitted mechanically from the spot-check sidecar rather than retyped.
 */

import { describe, expect, it } from 'vitest';
import { applyFixes, lint } from '../src/index.js';

/** One lint-then-fix pass — what the CLI does before it re-lints. */
const fixed = (text: string): string => applyFixes(text, lint(text));
const ruleNames = (text: string): string[] => [...new Set(lint(text).map((d) => d.rule))].sort();

describe('rulings / nnbsp-legacy — NNBSP to MVS, confirmed 4 of 4', () => {
  // The reader confirmed the swap renders identically in current Noto, which is
  // the whole claim: byte-different, glyph-identical.
  const cases: [string, string, string][] = [
    ['ааруулуудын', 'ᠠᠭᠠᠷᠤᠤᠯ\u202Fᠤ\u180Bᠳ\u202Fᠤ\u180Bᠨ', 'ᠠᠭᠠᠷᠤᠤᠯ\u180Eᠤᠳ\u180Eᠤᠨ'],
    ['мөнхийг', 'ᠮᠥᠩᢈᠡ\u202Fᠶ\u180Bᠢ', 'ᠮᠥᠩᠬᠡ\u180Eᠶᠢ'],
    ['залийг', 'ᠵᠠᠯᠢ\u202Fᠶ\u180Bᠢ', 'ᠵᠠᠯᠢ\u180Eᠶᠢ'],
    ['театраас', 'ᠲᠢᠶᠠᠲ\u180Bᠷ\u202Fᠠ\u180Bᠴᠠ', 'ᠲᠢᠶᠠᠲ\u180Bᠷ\u180Eᠠᠴᠠ'],
  ];
  for (const [cyrillic, before, after] of cases) {
    it(`fixes ${cyrillic}`, () => {
      expect(fixed(before)).toBe(after);
    });
  }
});

describe('rulings / wrong-block — Ali Gali to Hudum, confirmed 4 of 4', () => {
  // Both mappings are covered: U+1888 to ᠬ in all four, U+1889 to ᠭ in хэрэг.
  const cases: [string, string, string][] = [
    ['лууныхан', 'ᠯᠤᠤ\u202Fᠶ\u180Bᠢᠨ ᢈᠢᠨ', 'ᠯᠤᠤ\u180Eᠶᠢᠨ ᠬᠢᠨ'],
    ['зуу дахин', 'ᠵᠠᠭᠤ ᠳᠠᢈᠢᠨ', 'ᠵᠠᠭᠤ ᠳᠠᠬᠢᠨ'],
    ['хүрт', 'ᢈᠦᠷᠲᠡ', 'ᠬᠦᠷᠲᠡ'],
    ['давтан хэрэг', 'ᠳᠠᠪᠲᠠᠨ ᢈᠡᠷᠡᢉ', 'ᠳᠠᠪᠲᠠᠨ ᠬᠡᠷᠡᠭ'],
  ];
  for (const [cyrillic, before, after] of cases) {
    it(`fixes ${cyrillic}`, () => {
      expect(fixed(before)).toBe(after);
    });
  }
});

describe('rulings / unknown-suffix — dropping the stray FVS, confirmed 4 of 4', () => {
  // This one had been contradicted before ("the new unicode changes made it
  // really weird, and ours is the only correct way i've got the font to
  // behave"). Re-checked against current Noto on 2026-07-27 and confirmed four
  // times over: after a connector the FVS on the suffix head is redundant.
  const cases: [string, string, string][] = [
    ['гарлын', 'ᠭᠠᠷᠤᠯ\u202Fᠤ\u180Bᠨ', 'ᠭᠠᠷᠤᠯ\u180Eᠤᠨ'],
    ['цохиураа', 'ᠴᠣᢈᠢᠭᠤᠷ\u202Fᠢ\u180Bᠶᠠᠨ', 'ᠴᠣᠬᠢᠭᠤᠷ\u180Eᠢᠶᠠᠨ'],
    ['гохноос', 'ᠭᠣᠬᠠᠨ\u202Fᠠ\u180Bᠴᠠ', 'ᠭᠣᠬᠠᠨ\u180Eᠠᠴᠠ'],
  ];
  for (const [cyrillic, before, after] of cases) {
    it(`fixes ${cyrillic}`, () => {
      expect(fixed(before)).toBe(after);
    });
  }

  it('fixes a whole phrase without disturbing the chachlag on ᠪᠣᠯᠭ', () => {
    const before =
      'ᠪᠡᠯᢉᠡ\u202Fᠶ\u180Bᠢᠨ ᠬᠠᠷᠢᠴᠠᠭᠠᠨ\u202Fᠳ\u180Bᠤ ᠣᠷᠤᠬᠤ\u202Fᠶ\u180Bᠢ ᠰᠠᠨᠠᠯ ᠪᠣᠯᠭ\u180Eᠠ';
    const after = 'ᠪᠡᠯᠭᠡ\u180Eᠶᠢᠨ ᠬᠠᠷᠢᠴᠠᠭᠠᠨ\u180Eᠳᠤ ᠣᠷᠤᠬᠤ\u180Eᠶᠢ ᠰᠠᠨᠠᠯ ᠪᠣᠯᠭ\u180Eᠠ';
    expect(fixed(before)).toBe(after);
  });
});

describe('rulings / clean — no misses, confirmed 4 of 4', () => {
  // The reader read each of these as correct bichig. Silence is the right answer.
  const clean: [string, string][] = [
    ['ажилла', 'ᠠᠵᠢᠯᠯᠠ'],
    ['орогнодог', 'ᠣᠷᠤᠩᠨᠠᠳᠠᠭ'],
    ['тусгалаа', 'ᠲᠤᠰᠬᠠᠯ\u180Eᠠ'],
    ['бутралтай', 'ᠪᠤᠲᠠᠷᠠᠯᠲᠠᠢ'],
  ];
  for (const [cyrillic, text] of clean) {
    it(`stays silent on ${cyrillic}`, () => {
      expect(lint(text)).toHaveLength(0);
    });
  }
});

describe('rulings / running text', () => {
  it('repairs Магадгүй барууны соёлын нөлөө юм болов уу end to end', () => {
    const before = 'ᠮᠠᠭᠠᠳ ᠦᢉᠡᠢ ᠪᠠᠷᠠᠭᠤᠨ ᠤ\u180B ᠰᠣᠶᠤᠯ\u202Fᠤ\u180Bᠨ ᠨᠥᠯᠦᢉᠡ ᠶᠤᠮ ᠪᠣᠯᠪᠠ\u202Fᠤᠤ';
    const after = 'ᠮᠠᠭᠠᠳ ᠦᠭᠡᠢ ᠪᠠᠷᠠᠭᠤᠨ ᠤ\u180B ᠰᠣᠶᠤᠯ\u180Eᠤᠨ ᠨᠥᠯᠦᠭᠡ ᠶᠤᠮ ᠪᠣᠯᠪᠠ ᠤᠤ';
    expect(fixed(before)).toBe(after);
  });

  it('corrects NNBSP before the question particle ᠤᠤ to a plain space, not MVS', () => {
    // ᠤᠤ/ᠦᠦ/ᠪᠦᠦ/ᠦᠭᠡᠢ are separate words; swapping in MVS would trade a legacy
    // bug for a current one. Confirmed inside the sentence above.
    expect(fixed('ᠪᠣᠯᠪᠠ\u202Fᠤᠤ')).toBe('ᠪᠣᠯᠪᠠ ᠤᠤ');
  });

  // Ruled "fixed version is still wrong": ᠰᠠᠶᠢᠲᠠᠢ should be ᠰᠠᠢᠲᠠᠢ and
  // ᠪᠠᠶᠢᠭᠰᠠᠨ should be ᠪᠠᠢᠭᠰᠠᠨ — "1 и displays two shilbe after vowels in the
  // new unicode", so a medial glide ᠶ (U+1836) between a vowel and ᠢ (U+1822)
  // is the legacy spelling. mongol-bichig's orthography.md agrees that UTN #57
  // prefers the modern analysis. No rule covers it yet — docs/rules.md tier 3.
  it.todo('flags the legacy medial glide: vowel + U+1836 + U+1822 loses the glide');
});

describe('rulings / unknown-suffix — the registry gaps behind the warnings', () => {
  it('flags the doubled vowel after a connector in өтгөнөө, confirmed broken text', () => {
    // Reader: "it's a real word, but harvested was incorrect from the
    // beginning. it's өтгөн + өө so, written like ᠥᠳᠭᠡᠨ + MVS + ᠢᠶᠡᠨ".
    const ds = lint('ᠥᠳᢈᠡᠨ\u202Fᠡᠡ');
    expect(ds.some((d) => d.rule === 'unknown-suffix' && d.fix === undefined)).toBe(true);
  });

  // Ruled "real suffix — the registry is missing it", twice: холтосныхоо and
  // анчдынх. The run is ᠬᠢ (U+182C U+1822) — Cyrillic -ынх/-ных, the
  // nominalizer. The registry has it only inside ᠳᠠᠬᠢ/ᠳᠡᠬᠢ, never bare. 208 of
  // the 977 unknown-suffix warnings that survive a full fix pass across the
  // corpus are this one sequence. The addition belongs in
  // @gege-mn/mongol-bichig's connectorSuffixes, which reaches the converter too.
  it.todo('accepts bare ᠬᠢ after a connector once mongol-bichig registers it');

  // First ruled "i'd say it's a word, so regular space, no mvs. it's like дахь
  // дэх in cyrillic writing", against suffixes.md, which lists ᠳᠠᠬᠢ/ᠳᠡᠬᠢ as
  // registry-confirmed fused suffixes taking MVS. Re-asked 2026-07-27 and
  // settled the other way — "Keep it — sources win" — so the connector spelling
  // stays silent.
  it('accepts ᠳᠠᠬᠢ and ᠳᠡᠬᠢ after a connector, the registry over the first ruling', () => {
    expect(ruleNames('ᠭᠠᠵᠠᠷ\u180Eᠳᠠᠬᠢ')).toEqual([]);
    expect(ruleNames('ᠭᠡᠷ\u180Eᠳᠡᠬᠢ')).toEqual([]);
  });
});

describe('rulings / non-initial-o — loanwords are false positives', () => {
  // Both hits were ruled "loanword — should be exempt", with the general rule
  // stated outright: "foreign words can display O/Ö after first syllable".
  // рационализмаар carries ᠼ (U+183C), a foreign-only letter, so it is
  // detectable; лантаноид is spelled entirely with native letters and is not.
  //
  // Decided 2026-07-27: no exemption. Keying off a foreign-only letter would
  // clear рационализмаар and still miss лантаноид — inconsistency bought for no
  // coverage. Both stay known false positives, which is affordable precisely
  // because the rule can only ever be info.
  it('leaves the loanword false positives in place, at info severity', () => {
    const ds = lint('ᠮᠣᠩᠭᠣᠯ').filter((d) => d.rule === 'non-initial-o');
    expect(ds).toHaveLength(1);
    expect(ds[0]?.severity).toBe('info');
  });
});

describe('rulings / fvs-placement', () => {
  it('names what the selector landed on, so a doubled FVS is not read as a complaint about the letter', () => {
    // редакторлах arrived as ᠳ + FVS1 + FVS1: the rule flags the *second*
    // selector, but the old message said only "must follow the letter it
    // modifies", and the reader ruled it a false alarm for a claim the rule was
    // never making. Their own spelling drops the selector on ᠳ entirely.
    const ds = lint('ᠷᠧᠳ\u180B\u180Bᠠᠻᠲ\u180Bᠣᠷᠯᠠᠬᠤ').filter((d) => d.rule === 'fvs-placement');
    expect(ds).toHaveLength(1);
    expect(ds[0]?.start).toBe(4);
    expect(ds[0]?.message).toContain('follows FVS1');
  });

  it('accepts the single FVS1 on ᠲ that the reader keeps for the foreign т', () => {
    // Reader's own spelling of редакторлах: "no fvs1 after d, only after t to
    // preserve foreign word T".
    const ds = lint('ᠷᠧᠳᠠᠻᠲ\u180Bᠣᠷᠯᠠᠬᠤ').filter((d) => d.rule === 'fvs-placement');
    expect(ds).toHaveLength(0);
  });

  // Open: the reader's substantive point is that a redundant selector has "0
  // effect", which argues about severity, not placement. Re-ask with the new
  // message before changing anything.
  // Re-asked 2026-07-27 and settled: it stays an error. A selector that follows
  // a selector modifies nothing, so its placement is structurally invalid — not
  // a matter of orthographic taste, which is what warning severity is for.
  it('keeps a doubled FVS at error severity', () => {
    const ds = lint('ᠷᠧᠳ\u180B\u180Bᠠᠻᠲ\u180Bᠣᠷᠯᠠᠬᠤ').filter((d) => d.rule === 'fvs-placement');
    expect(ds[0]?.severity).toBe('error');
  });
});

describe('rulings / zwj-zwnj — the abbreviation pattern, ruled 2026-07-27', () => {
  // Both draws were abbreviations punctuated with U+1802: ЗХУ and ЕХ, each
  // letter followed by ZWJ to hold a non-final form before the Mongolian comma.
  // Re-asked and ruled: "most sources do use ZWJ." The core spec agrees —
  // 16.0 §13.5 says ZWJ/ZWNJ "may be used to select a particular positional
  // form of a letter in isolation", and lists <1820 200D> for the initial
  // form. The rule flagged all 85 joiners in the harvest corpus and every one
  // was this pattern, so it was 100% false positives. It now flags only a
  // joiner *between* two letters — a case the corpus never contains.
  it('accepts the ЗХУ abbreviation pattern', () => {
    expect(ruleNames('ᠵᠢ\u200D᠂ᠬᠤ\u200D᠂ᠤ\u200D')).toEqual([]);
  });

  it('still flags a joiner between two letters, where FVS is the mechanism', () => {
    expect(ruleNames('ᠠ\u200Dᠯ')).toEqual(['zwj-zwnj']);
  });
});

describe('rulings / gaps the samples exposed', () => {
  // холтосныхоо, агаар мандал дахь…, Магадгүй… all write the genitive ᠤ as a
  // separate token after a plain U+0020, and the linter says nothing. This is
  // planned rule 8, `space-before-suffix` — the same bug found by hand in
  // gege.mn's footer. The corpus says it is not rare.
  it.todo('space-before-suffix: plain U+0020 before a known suffix');

  // 28 of the surviving unknown-suffix runs in the word corpus are ᠠᠠ or ᠡᠡ.
  // orthography.md: long a/e are never doubled, they take the γ/g hiatus, so
  // adjacent U+1820 U+1820 or U+1821 U+1821 is a typo or a letter-for-letter
  // Cyrillic artifact. Confirmed once, in өтгөнөө above; `doubled-ae` shipped.
  it('doubled-ae fires with no connector in front of the pair', () => {
    // Synthetic — the only claim under test is that a connector is not needed.
    expect(lint('ᠨᠡᠷᠡᠡ').some((d) => d.rule === 'doubled-ae')).toBe(true);
  });
});

describe('rulings / sequence check — the six residual runs, 2026-07-27', () => {
  // One ruling per sequence rather than per word. The reader answered all six;
  // four are corroborated by an outside source, one is contested by it, and one
  // could not be validated at all. Sources are named per case — the linter's
  // own corpus counts are not evidence about what is correct Mongolian.

  // CONFIRMED TWICE OVER. Ruled "real suffix, add it to the registry", and
  // L2/17-036 Appendix IV ("Mongolian suffixes as connected by NNBSP", the
  // proposal that produced U+180F) lists NNBSP+182C+1822 under CASE-BOUND
  // POSSESSION — together with ᠬᠢᠨ (NNBSP+182C+1822+1828), which is the -ныхан
  // in лууныхан from the previous spot check. Both belong in mongol-bichig.
  it.todo('accepts bare ᠬᠢ and ᠬᠢᠨ after a connector once mongol-bichig registers them');

  // Ruled "real word, plain space". Corroborated: the CeLCAR Mongolian grammar
  // files шиг under "Postpositions of Comparison: шиг, мэт", and it appears
  // nowhere in Appendix IV's suffix inventory.
  it.todo('treats ᠰᠢᠭ as a space-joined word, not a connector suffix');

  // Ruled "real word, plain space". Appendix IV lists ᠤᠷᠤᠭᠤ under "DIRECTIVE
  // CASE (may or may not use NNBSP)" — explicitly optional — and Wiktionary's
  // руу entry notes that "due to its recent development as a grammatical case,
  // directive case suffixes are written with a space between the stem and
  // suffix". So a connector is tolerated by the only source that lists it.
  //
  // Re-asked 2026-07-27 with that conflict spelled out; ruled "keep the warning
  // and the fix". This is the one place the linter is knowingly stricter than a
  // published source, on the reader's authority. 65 corpus hits.
  it.todo('ᠤᠷᠤᠭᠤ warns with a fix to a plain space, once mongol-bichig ships it');

  // Ruled "not valid Mongolian", with the reason: "just single a/e does the job
  // of аа/ээ and it is to be written as a separate word with full space… this
  // specific a/e is for calling people or calling things." Appendix IV confirms
  // the substance — its VOCATIVE CASE entry is a *single* ᠠ / ᠡ — but writes it
  // with the connector, not a space. Re-asked 2026-07-27: "let's just use
  // regular space with singular a or e" — a second deliberate dissent from
  // Appendix IV, alongside ᠤᠷᠤᠭᠤ above. The reader added why the doubled form
  // is so common in harvested text: Cyrillic requires "аав аа" / "ээж ээ" with
  // a space, "but many people writing just smush them together, so it's hard to
  // distinguish if 'ааваа' means abu-ban or abu a" — i.e. the ambiguity is
  // introduced in Cyrillic and then transliterated letter for letter. That is
  // also why `doubled-ae` can carry no fix: the two readings want different
  // repairs. `doubled-ae` ships and settles the doubled form.
  it.todo('space-before-suffix must not flag a plain space before a lone ᠠ/ᠡ (vocative)');

  // Re-asked, and the reader separated two morphemes that are identical in
  // Cyrillic: "сан/сэн/сон/сөн = past time suffixes, attached to the word as
  // гсан or гсэн. the other one (which was provided in the 6 questions) сан сэн
  // written separately, and expresses sort of wish or regret 'тэгэх юм сан'."
  // So the sources and the ruling were describing different things. Only the
  // modal is registered, as a space-joined word; the participle is inside the
  // word as ᠭᠰᠠᠨ and needs no entry at all. A connector-split ᠰᠠᠨ is wrong
  // under either reading, which is what the 15 corpus hits are.
  it.todo('ᠰᠠᠨ/ᠰᠡᠨ (the modal) is named a separate word once mongol-bichig ships it');

  // NOT VALIDATED, and the reader flagged their own uncertainty. Nothing lists
  // ᠯᠠ/ᠯᠡ either way. Wiktionary has л as a Mongolian particle, but that cuts
  // both ways: the registry ALREADY carries particles Cyrillic writes
  // separately and bichig connects — ᠨᠢ/ᠮᠢᠨᠢ/ᠴᠢᠨᠢ (нь, минь, чинь) and ᠳᠠ/ᠳᠡ
  // (даа), which CeLCAR groups in the same word class as л. Cyrillic spacing is
  // therefore not evidence for bichig spacing. Still needs a real source.
  //
  // Shipped anyway on the ruling, 2026-07-27, because the failure mode is
  // asymmetric: registering it only makes the linter *silent* on those 465
  // hits, since no rule yet objects to the space spelling. Being wrong here
  // under-reports; it never invents an error. Reversal is one registry line.
  it.todo('accepts ᠯᠠ/ᠯᠡ after a connector once mongol-bichig registers it');
});
