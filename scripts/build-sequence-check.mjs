#!/usr/bin/env node
/**
 * Build the sequence check: one ruling per *sequence*, not per word.
 *
 * The random spot check (`build-spotcheck.mjs`) samples words and asks whether
 * the linter is right about each. This drill asks the higher-leverage question.
 * After every mechanical fix is applied and the text re-linted, the surviving
 * `unknown-suffix` warnings across the whole corpus collapse onto a handful of
 * distinct letter runs — six of them account for nearly all of it. Each is
 * either a gap in the shared suffix registry, a word that should never have
 * been connector-joined, or genuinely broken text, and one reader ruling
 * settles hundreds of corpus hits at once.
 *
 * So each card is a sequence: what it is, how often it occurs, what the linter
 * says about it today, real examples in context, and my guess — stated as a
 * guess, because the reader has corrected them before.
 *
 * Examples are shown **repaired** (`applyFixes` applied). The NNBSP, stray-FVS
 * and Ali Gali questions were settled on 2026-07-27; re-showing that noise
 * would spend the reader's attention on answers we already have.
 *
 *   node scripts/build-sequence-check.mjs [out.html] [--examples 4]
 *                                         [--corpus ../gege-converter/.tmp]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cpRow, esc, optionBlock, renderPage } from './lib/review-page.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const FLAGS_TAKING_A_VALUE = new Set(['--examples', '--corpus']);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const positional = args.find(
  (a, i) => !a.startsWith('--') && !FLAGS_TAKING_A_VALUE.has(args[i - 1] ?? ''),
);
const OUT = positional ?? '.tmp/sequence-check.html';
const PER_SEQUENCE = Number(flag('--examples', 4));
const CORPUS = resolve(ROOT, flag('--corpus', '../gege-converter/.tmp'));

const dist = resolve(ROOT, 'dist/index.js');
if (!existsSync(dist)) {
  console.error('dist/ is missing — run `pnpm build` first.');
  process.exit(1);
}
const { lint, applyFixes } = await import(pathToFileURL(dist).href);

// ------------------------------------------------------------- the questions

/**
 * The six, ordered by how much corpus each one moves. Harmonic mates share a
 * card: masculine and feminine forms of one morpheme get one ruling, not two.
 *
 * `guess` is deliberately labelled as a guess on the page. Anchoring a reader
 * is a real risk, but so is making them reconstruct from scratch what a
 * five-minute lookup already suggests — and this reader pushes back readily.
 */
const SEQUENCES = [
  {
    id: 'S1',
    runs: ['ᠯᠠ', 'ᠯᠡ'],
    translit: 'la / le',
    cyrillic: 'л',
    guess:
      'The emphatic particle Cyrillic writes as a separate л (гэхэд л, нэг л). If it is a clitic it belongs in the registry; if it is a word it belongs with ᠤᠤ/ᠦᠦ/ᠦᠭᠡᠢ in the space-joined list. It cannot stay in neither, which is where it is now.',
  },
  {
    id: 'S2',
    runs: ['ᠬᠢ'],
    translit: 'qi / ki',
    cyrillic: '-ынх / -ных',
    guess:
      'You already ruled this one a real suffix twice, on анчдынх and холтосныхоо — the nominalizer. It is in the registry only inside ᠳᠠᠬᠢ/ᠳᠡᠬᠢ, never bare. This card is here to confirm the general case before it is added, and to catch any context where bare ᠬᠢ would be wrong.',
  },
  {
    id: 'S3',
    runs: ['ᠰᠢᠭ'],
    translit: 'sig',
    cyrillic: 'шиг',
    guess:
      'The comparative "like/as". Cyrillic writes it as a separate word, which suggests a plain space rather than a connector — the same shape as the ᠦᠭᠡᠢ ruling from 2026-07-25.',
  },
  {
    id: 'S4',
    runs: ['ᠠᠠ', 'ᠡᠡ'],
    translit: 'aa / ee',
    cyrillic: '-аа / -ээ',
    guess:
      'I guessed "always broken" — a doubled a/e being a letter-for-letter Cyrillic artifact, since long a/e take the γ/g hiatus — and you already ruled one that way (өтгөнөө, where it should have been ᠢᠶᠡᠨ). But the examples below look like two different things: адмиралаа/ахмадаа/аюулаа are the reflexive -аа that should have been ᠢᠶᠠᠨ, while аав аа is the vocative particle, which is a separate word and may be perfectly correct. If they split, say so — that is the ruling, and it decides whether a `doubled-ae` rule can be categorical.',
  },
  {
    id: 'S5',
    runs: ['ᠤᠷᠤᠭᠤ'],
    translit: 'uruγu',
    cyrillic: 'руу / рүү',
    guess:
      'The directional postposition "towards". Almost certainly a separate word rather than a suffix, but it is worth your ruling because Cyrillic contracts it onto the noun and the harvest evidently treats it as attachable.',
  },
  {
    id: 'S6',
    runs: ['ᠰᠠᠨ'],
    translit: 'san',
    cyrillic: '-сан / -сон',
    guess:
      'I expected the past participle throughout — your earlier note was "сан/сон = гсан", which would put it on the stem as ᠭᠰᠠᠨ rather than after a connector. The examples complicate that: юмсан and сайхан сан look like the modal clitic that follows a whole phrase, not a participle on a stem. If those are two different morphemes, they may need two different answers.',
  },
];

const OPTIONS = [
  'Real suffix — connector-joined, add it to the registry',
  'Real word — takes a plain space, never a connector',
  'Belongs on the stem — should not be split off at all',
  'Not valid Mongolian — the text is wrong',
];

// ---------------------------------------------------------------- the corpus

function rows(file) {
  const path = resolve(CORPUS, file);
  if (!existsSync(path)) return [];
  const out = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (line.length === 0) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // torn last line
    }
  }
  return out;
}

/** The space-delimited word containing [start, end) — connector-joined pieces stay whole. */
function wordAround(cps, start, end) {
  let a = start;
  let b = end;
  while (a > 0 && cps[a - 1] !== ' ') a--;
  while (b < cps.length && cps[b] !== ' ') b++;
  return cps.slice(a, b).join('');
}

const byRun = new Map();
let scanned = 0;
for (const [file, kind] of [
  ['harvest-harvest.jsonl', 'word'],
  ['harvest-sentences.jsonl', 'sentence'],
]) {
  for (const r of rows(file)) {
    if (typeof r.raw !== 'string' || r.raw.length === 0) continue;
    scanned++;
    const repaired = applyFixes(r.raw, lint(r.raw));
    const cps = [...repaired];
    for (const d of lint(repaired)) {
      if (d.rule !== 'unknown-suffix' || d.fix !== undefined) continue;
      const run = cps.slice(d.start, d.end).join('');
      const entry = byRun.get(run) ?? { count: 0, examples: [] };
      entry.count++;
      entry.examples.push({
        word: wordAround(cps, d.start, d.end),
        cyrillic: r.cyrillic ?? '',
        kind,
        message: d.message,
      });
      byRun.set(run, entry);
    }
  }
}
if (scanned === 0) {
  console.error(`no corpus under ${CORPUS} — pass --corpus <dir> with the harvest JSONL.`);
  process.exit(1);
}

/** Word rows first — their Cyrillic names one word, a sentence's names the sentence. */
const chooseExamples = (runs, n) => {
  const seen = new Set();
  const pool = runs.flatMap((run) => byRun.get(run)?.examples ?? []);
  const ordered = [
    ...pool.filter((e) => e.kind === 'word'),
    ...pool.filter((e) => e.kind !== 'word'),
  ];
  const out = [];
  for (const e of ordered) {
    if (out.length >= n) break;
    if (seen.has(e.word)) continue;
    seen.add(e.word);
    out.push(e);
  }
  return out;
};

for (const s of SEQUENCES) {
  s.count = s.runs.reduce((n, run) => n + (byRun.get(run)?.count ?? 0), 0);
  s.examples = chooseExamples(s.runs, PER_SEQUENCE);
  s.message = s.examples[0]?.message ?? '';
}

// ---------------------------------------------------------------- rendering

const cut = (s, n) => {
  const cps = [...s];
  return cps.length <= n ? s : `${cps.slice(0, n).join('')}…`;
};

const exampleBox = (e) =>
  `<figure class="ex"><div class="mn">${esc(e.word)}</div>
   <figcaption class="excy"><b>${esc(cut(e.cyrillic, 46))}</b>${
     e.kind === 'sentence' ? '<br>from running text' : ''
}</figcaption></figure>`;

const card = (s) => `<div class="card">
  <p class="seqline"><span class="qid">${s.id}</span>
    <span class="seqmn">${esc(s.runs.join(' / '))}</span>
    <code>${esc(s.translit)}</code>
    <span class="cy">${esc(s.cyrillic)}</span>
    <span class="hits">${s.count.toLocaleString('en-US')} hits</span></p>
  ${s.runs
    .map(
      (run) =>
        `<div class="cps"><span class="cpl"></span>${cpRow(run, [{ start: 0, end: [...run].length }])}</div>`,
    )
    .join('')}
  <p class="says">Today the linter says: <em>${esc(s.message)}</em></p>
  <div class="guess"><b>My guess, and it is only a guess:</b> ${esc(s.guess)}</div>
  <div class="exlist">${s.examples.map(exampleBox).join('')}</div>
  ${optionBlock(s.id, OPTIONS)}
</div>`;

const total = SEQUENCES.reduce((n, s) => n + s.count, 0);
const allUnknown = [...byRun.values()].reduce((n, e) => n + e.count, 0);
const covered = Math.round((total / allUnknown) * 100);

const LEDE = `<p class="lede">Six sequences, one ruling each. These are what is left of
<strong>${allUnknown.toLocaleString('en-US')} <code>unknown-suffix</code> warnings</strong> after every
mechanical fix has been applied and the text re-linted — the six below account for
<strong>${covered}%</strong> of them, so each answer here settles hundreds of corpus hits at once.</p>
<p class="lede">Every sequence is one of three things: a <strong>real suffix</strong> the shared
registry is missing, a <strong>real word</strong> that should take a plain space and never a
connector, or <strong>broken text</strong>. The one thing it cannot be is what it is now — silently
warned about with no answer. Where a masculine and feminine form share a card, one ruling covers
both.</p>
<p class="lede">Examples are shown <strong>repaired</strong>: the NNBSP, stray-FVS and Ali Gali
questions are settled, so that noise is gone and what you see is the sequence in the context of an
otherwise-clean word. Pick an option, add a note — the note is the valuable part here, because a
meaning or a mirror case is what makes a sequence addable — then hit <strong>Copy</strong>.</p>`;

const html = renderPage({
  title: 'gege-linter sequence check',
  h1: 'Sequence check',
  lede: LEDE,
  sections: SEQUENCES.map(card).join(''),
  ids: SEQUENCES.map((s) => s.id),
  labels: Object.fromEntries(SEQUENCES.map((s) => [s.id, `${s.runs.join('/')} ${s.cyrillic}`])),
  blockTitle: 'SEQUENCE CHECK ANSWERS',
  extraStyle: true,
});

// .tmp/ is gitignored, so it is absent on a fresh clone.
mkdirSync(dirname(resolve(ROOT, OUT)), { recursive: true });
writeFileSync(resolve(ROOT, OUT), html);
console.log(`wrote ${OUT}  (${SEQUENCES.length} sequences, ${covered}% of ${allUnknown} warnings)`);
for (const s of SEQUENCES) {
  console.log(
    `  ${s.id}  ${s.runs.join('/').padEnd(8)} ${String(s.count).padStart(5)} hits, ${s.examples.length} examples`,
  );
}

// Anything big that the six do not cover — so a shifted picture is visible, not silent.
const chosen = new Set(SEQUENCES.flatMap((s) => s.runs));
const rest = [...byRun]
  .filter(([run]) => !chosen.has(run))
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 6);
if (rest.length > 0) {
  console.log('  not covered by these six:');
  for (const [run, e] of rest) {
    const cps = [...run].map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase()}`).join(' ');
    console.log(`     ${String(e.count).padStart(5)}  ${cps}`);
  }
}
