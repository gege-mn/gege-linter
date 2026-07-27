#!/usr/bin/env node
/**
 * Build an interactive lint spot-check page for a bichig reader.
 *
 * Meant to be re-run periodically, not once: after any rule change, this draws
 * a fresh random sample of REAL third-party bichig, runs `lint` over it, and
 * asks a reader to rule on what the linter said. Selections collect into one
 * copy-pasteable block at the bottom.
 *
 * The corpus is the raw, unrepaired Tungaamal output kept in gege-converter's
 * gitignored `.tmp/` (harvest-harvest.jsonl, one word per row;
 * harvest-sentences.jsonl, running text). Nothing in the shipped package
 * touches it — this is a dev script, and it degrades to a clear error if the
 * sibling checkout is not there. Point `--corpus` elsewhere to use another.
 *
 * What the reader is being asked is NOT "is this word spelled right" but "is
 * the linter right about it": a false warning on honest text is the worst bug
 * this project can ship, and a miss on broken text is the second worst. So the
 * groups are one per rule, plus a clean group that exists only to hunt misses.
 *
 * Bichig renders vertically in a real Mongolian font because the terminal
 * shows wrong glyphs and no vertical layout. Code points sit under every
 * rendering with the flagged span marked — for the connector rules the two
 * renderings are byte-different and glyph-identical by design, so the code
 * points are the only place the difference is visible at all.
 *
 *   node scripts/build-spotcheck.mjs [out.html] [--n 4] [--seed 12345]
 *                                    [--corpus ../gege-converter/.tmp]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  cpRow,
  esc,
  optionBlock,
  renderPage,
  scriptBox,
  showFix,
  uplus,
} from './lib/review-page.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const FLAGS_TAKING_A_VALUE = new Set(['--n', '--seed', '--corpus']);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const positional = args.find(
  (a, i) => !a.startsWith('--') && !FLAGS_TAKING_A_VALUE.has(args[i - 1] ?? ''),
);
const OUT = positional ?? '.tmp/spotcheck.html';
const PER_GROUP = Number(flag('--n', 4));
const SEED = Number(flag('--seed', Math.floor(Math.random() * 1e9)));
const CORPUS = resolve(ROOT, flag('--corpus', '../gege-converter/.tmp'));

const dist = resolve(ROOT, 'dist/index.js');
if (!existsSync(dist)) {
  console.error('dist/ is missing — run `pnpm build` first.');
  process.exit(1);
}
const { lint, applyFixes } = await import(pathToFileURL(dist).href);

// --------------------------------------------------------------- the corpus

/** Reproducible draws: same seed, same page. */
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);

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

/**
 * One reviewable sample. `text` is the untouched harvest string — never
 * `.trim()`ed, because JavaScript's `\s` matches U+202F and trimming would
 * silently destroy the connector being measured.
 */
const samples = [];
for (const r of rows('harvest-harvest.jsonl')) {
  if (typeof r.raw === 'string' && r.raw.length > 0) {
    samples.push({ text: r.raw, cyrillic: r.cyrillic ?? '', kind: 'word' });
  }
}
const sentences = [];
for (const r of rows('harvest-sentences.jsonl')) {
  if (typeof r.raw === 'string' && r.raw.length > 0) {
    sentences.push({ text: r.raw, cyrillic: r.cyrillic ?? '', kind: 'sentence' });
  }
}
if (samples.length === 0 && sentences.length === 0) {
  console.error(`no corpus under ${CORPUS} — pass --corpus <dir> with the harvest JSONL.`);
  process.exit(1);
}

for (const s of [...samples, ...sentences]) {
  s.diags = lint(s.text);
  s.fixed = applyFixes(s.text, s.diags);
  s.rules = [...new Set(s.diags.map((d) => d.rule))];
}

// ---------------------------------------------------------------- the groups

const has = (rule, extra) => (s) =>
  s.diags.some((d) => d.rule === rule && (extra === undefined || extra(d)));

const GROUPS = [
  {
    key: 'E',
    title: 'Errors',
    n: 2,
    pool: () => samples,
    pick: (s) => s.diags.some((d) => d.severity === 'error'),
    blurb:
      'Error severity is the linter claiming something is indisputably malformed — the CLI exits non-zero on these. One false error would make the tool unusable in CI, so these get read first. They are also vanishingly rare in the wild, which is itself worth confirming.',
    options: [
      'Real error',
      'False alarm — this is valid',
      'Broken, but the diagnosis is wrong',
      'Not a real word',
    ],
  },
  {
    key: 'N',
    title: 'Legacy NNBSP connector',
    n: PER_GROUP,
    pool: () => samples,
    pick: has('nnbsp-legacy'),
    blurb:
      'The connector before the suffix is NNBSP (U+202F), legacy since Unicode 16.0; the fix swaps in MVS (U+180E), or a plain space where the thing after it is a separate word (ᠦᠭᠡᠢ, ᠤᠤ/ᠦᠦ, ᠪᠦᠦ). The two renderings below should look IDENTICAL — only the bytes differ. So judge two things: (a) does the fixed version still shape correctly in your font, and (b) is a connector right here at all?',
    options: [
      'Fix is right',
      'Should be a plain space, not a connector',
      'Should not be joined at all',
      'Renders differently after the fix (font breaks)',
      'Not a real word',
    ],
  },
  {
    key: 'B',
    title: 'Wrong-block look-alikes',
    n: PER_GROUP,
    pool: () => samples,
    pick: has('wrong-block'),
    blurb:
      'Tungaamal writes feminine g/k as the Ali Gali letters U+1889/U+1888 instead of U+182D/U+182C — carrying one bit more than correct Unicode does. The fix rewrites them to the Hudum letters. Here the shapes SHOULD match too, but from a different code point, so a real rendering difference is meaningful evidence.',
    options: [
      'Fix is right',
      'Fixed version is wrong',
      'Shapes differ after the fix',
      'Not a real word',
    ],
  },
  {
    key: 'S',
    title: 'Stray FVS on the suffix',
    n: PER_GROUP,
    pool: () => samples,
    pick: has('unknown-suffix', (d) => d.fix !== undefined),
    blurb:
      'The suffix is a dictionary suffix written with a variation selector on its head vowel (ᠦ + FVS1 + ᠨ). The linter claims the FVS is redundant because shaping after a connector is automatic, and drops it. This is the one you have contradicted before — you said the FVS spelling was the only way you could get the font to behave. Re-check it against your current Noto: if the two renderings differ, the rule is wrong and needs to go.',
    options: [
      'Fix is right — FVS was redundant',
      'FVS is required — dropping it is wrong',
      'Renders differently after the fix',
      'Not a real word',
    ],
  },
  {
    key: 'U',
    title: 'Unknown suffix',
    n: PER_GROUP,
    pool: () => samples,
    pick: has('unknown-suffix', (d) => d.fix === undefined),
    blurb:
      'A connector introducing a letter sequence that is not one of the 63 entries in the shared suffix registry. Either the text is wrong, or the registry has a gap — and a gap is a fix that belongs in @gege-mn/mongol-bichig, where the converter would get it too. Say which it is; if it is a real suffix, its meaning in the note is what makes it addable.',
    options: [
      'Real suffix — the registry is missing it',
      'Not a suffix — the text is wrong',
      'The connector itself does not belong here',
      'Not a real word',
    ],
  },
  {
    key: 'O',
    title: 'Non-initial o/ö',
    n: 3,
    pool: () => samples,
    pick: has('non-initial-o'),
    blurb:
      'Info severity, and openly a heuristic: after the first syllable a masculine word takes ᠤ and a feminine one ᠦ, so an o/ö there is usually a Cyrillic-ism. It stays at info because loanwords (ᠹᠣᠲᠣ, ᠻᠢᠨᠣ) and ᠭᠣᠣᠯ are genuine exceptions. Each hit is only asking: is the hint right for this word?',
    options: [
      'Right — should be ᠤ/ᠦ',
      'Wrong — o/ö is correct here',
      'Loanword — should be exempt',
      'Not a real word',
    ],
  },
  {
    key: 'Z',
    title: 'ZWJ / ZWNJ',
    n: 2,
    pool: () => samples,
    pick: has('zwj-zwnj'),
    blurb:
      'A zero-width joiner or non-joiner next to a Mongolian letter — the pre-standard way of forcing a positional form before FVS existed. Warning with no fix, because what the author meant is not mechanically recoverable. Asking whether flagging it is right, and what the intended form was.',
    options: ['Right to flag it', 'Legitimate here — should not be flagged', 'Not a real word'],
  },
  {
    key: 'C',
    title: 'Clean',
    n: PER_GROUP,
    pool: () => samples.filter((s) => [...s.text].length >= 6),
    pick: (s) => s.diags.length === 0,
    blurb:
      'The linter found nothing at all in these. This group exists only to hunt misses — the failure mode the other groups are blind to. If anything here is wrong and we stayed silent, that is the finding.',
    options: ['Clean — nothing wrong', 'Something IS wrong and we missed it', 'Not a real word'],
  },
  {
    key: 'T',
    title: 'Running text',
    n: 2,
    pool: () => sentences,
    pick: () => true,
    blurb:
      'Whole sentences, which is how gege.mn will actually call this. Everything the linter found is summarised, and the fully-fixed version sits beside the original. Read the fixed one as a sentence: did the repairs leave it sound?',
    options: [
      'Fixed version is right',
      'Fixed version is still wrong',
      'A fix broke something that was fine',
      'Both versions read fine',
    ],
  },
];

const pick = (pool, n, used) => {
  const bag = [...pool];
  const out = [];
  while (out.length < n && bag.length > 0) {
    const i = Math.floor(rand() * bag.length);
    const [s] = bag.splice(i, 1);
    if (used.has(s.text)) continue;
    used.add(s.text);
    out.push(s);
  }
  return out;
};

const used = new Set();
for (const g of GROUPS) {
  const candidates = g.pool().filter(g.pick);
  g.candidates = candidates.length;
  g.items = pick(candidates, g.n, used);
}

// ---------------------------------------------------------------- rendering

const sevChip = (d) => `<span class="sev s-${d.severity}">${d.severity}</span>`;

function diagLine(d, primary) {
  return `<li class="${primary ? 'primary' : ''}">${sevChip(d)}
    <code>${esc(d.rule)}</code>
    <span class="msg">${esc(d.message)}</span>
    <span class="at">cp ${d.start}–${d.end}${
      d.fix === undefined ? ' · no fix' : ` · fix → ${esc(showFix(d.fix))}`
    }</span></li>`;
}

function itemBlock(g, item, id) {
  const primary = item.diags.find((d) => (g.key === 'E' ? d.severity === 'error' : true));
  const spans = item.diags
    .filter((d) => (g.key === 'C' ? false : d.rule === (primary?.rule ?? '')))
    .map((d) => ({ start: d.start, end: d.end }));
  const changed = item.fixed !== item.text;
  const long = item.kind === 'sentence';

  const summary =
    item.diags.length === 0
      ? '<p class="none">no diagnostics</p>'
      : long
        ? `<p class="none">${item.diags.length} diagnostics: ${esc(
            [
              ...new Set(
                item.diags.map(
                  (d) => `${d.rule} ×${item.diags.filter((x) => x.rule === d.rule).length}`,
                ),
              ),
            ].join(', '),
          )}</p>`
        : `<ul class="diags">${item.diags.map((d) => diagLine(d, d === primary)).join('')}</ul>`;

  return `<div class="card">
  <p class="head"><span class="qid">${id}</span>
     <span class="cy">${esc(item.cyrillic)}</span></p>
  ${summary}
  <div class="scripts${long ? ' wide' : ''}">
    ${scriptBox('as harvested', item.text, 'untouched third-party output')}
    ${changed ? scriptBox('after gege-linter --fix', item.fixed, 'what we would write') : ''}
  </div>
  <div class="cps"><span class="cpl">before</span>${cpRow(item.text, spans)}</div>
  ${changed ? `<div class="cps"><span class="cpl">after</span>${cpRow(item.fixed, [])}</div>` : ''}
  ${optionBlock(id, g.options)}
</div>`;
}

const allIds = [];
const labels = {};
/** Sidecar record, so a pasted-back answer block can be graded against what was asked. */
const asked = {};
const sections = GROUPS.filter((g) => g.items.length > 0)
  .map((g) => {
    const blocks = g.items.map((item, i) => {
      const id = `${g.key}${i + 1}`;
      allIds.push(id);
      labels[id] = item.cyrillic || [...item.text].slice(0, 12).join('');
      asked[id] = {
        group: g.title,
        cyrillic: item.cyrillic,
        before: [...item.text].map(uplus).join(' '),
        after: item.fixed === item.text ? null : [...item.fixed].map(uplus).join(' '),
        diagnostics: item.diags.map((d) => ({
          rule: d.rule,
          severity: d.severity,
          message: d.message,
          span: [d.start, d.end],
          fix: d.fix === undefined ? null : showFix(d.fix),
        })),
      };
      return itemBlock(g, item, id);
    });
    return `<h2>${esc(g.title)} <span class="pool">${g.items.length} of ${g.candidates.toLocaleString(
      'en-US',
    )} in corpus</span></h2><p class="sub">${esc(g.blurb)}</p>${blocks.join('')}`;
  })
  .join('');

const corpusLine = `${samples.length.toLocaleString('en-US')} words + ${sentences.length.toLocaleString('en-US')} sentences`;

const LEDE = `<p class="lede">A random draw from <strong>${corpusLine}</strong> of real, unrepaired
third-party bichig — every sample below is text somebody else's converter actually produced.
The question on each card is not whether the word is spelled right; it is
<strong>whether the linter is right about it</strong>. Pick an option, add a note where it
helps, then hit <strong>Copy</strong> and paste the block back to me.</p>
<p class="lede">Two things to keep in mind while reading. <strong>NNBSP and MVS shape
identically</strong> in Noto — a before/after pair that looks the same is the expected result,
not a non-answer, and the code-point rows under each pair are where the difference actually
lives. And a <strong>rendering difference where none was expected is a finding</strong>: say so
in the note, because it means a fix is changing more than the bytes.</p>
<p class="lede">Seed <code>${SEED}</code> · reproduce this exact page with
<code>node scripts/build-spotcheck.mjs --seed ${SEED}</code></p>`;

const html = renderPage({
  title: 'gege-linter spot check',
  h1: 'Lint spot check',
  lede: LEDE,
  sections,
  ids: allIds,
  labels,
  blockTitle: `LINT SPOT CHECK ANSWERS (seed ${SEED})`,
});

// .tmp/ is gitignored, so it is absent on a fresh clone.
mkdirSync(dirname(resolve(ROOT, OUT)), { recursive: true });
writeFileSync(resolve(ROOT, OUT), html);
const sidecar = `${OUT.replace(/\.html?$/, '')}.json`;
writeFileSync(resolve(ROOT, sidecar), `${JSON.stringify({ seed: SEED, asked }, null, 2)}\n`);

console.log(`wrote ${OUT}  (seed ${SEED}, ${allIds.length} items)`);
console.log(`wrote ${sidecar}  (what each id asked, for grading the answers)`);
for (const g of GROUPS) {
  console.log(`  ${g.title.padEnd(26)} ${String(g.items.length).padStart(2)} of ${g.candidates}`);
}
