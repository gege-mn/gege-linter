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

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

/** The characters a reader cannot see, and the two letters they cannot tell apart. */
const NAMED = new Map([
  ['\u202F', 'NNBSP'],
  ['\u180E', 'MVS'],
  ['\u180B', 'FVS1'],
  ['\u180C', 'FVS2'],
  ['\u180D', 'FVS3'],
  ['\u180F', 'FVS4'],
  ['\u180A', 'NIRUGU'],
  ['\u200D', 'ZWJ'],
  ['\u200C', 'ZWNJ'],
  ['\u0020', 'SP'],
  ['\u1888', 'ALI GALI KA'],
  ['\u1889', 'ALI GALI GA'],
]);

const uplus = (ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;

/** Code points as chips, with the diagnostic's span marked. */
function cpRow(text, spans) {
  return [...text]
    .map((ch, i) => {
      const hit = spans.some((s) => i >= s.start && i < s.end);
      const name = NAMED.get(ch);
      return `<span class="cpc${hit ? ' hit' : ''}${name ? ' inv' : ''}">${uplus(ch)}${
        name ? `<em>${esc(name)}</em>` : ''
      }</span>`;
    })
    .join('');
}

const scriptBox = (label, text, caption) =>
  `<figure class="sbox"><div class="mn">${esc(text)}</div>
   <figcaption><strong>${esc(label)}</strong>${caption ? `<br>${esc(caption)}` : ''}</figcaption></figure>`;

const sevChip = (d) => `<span class="sev s-${d.severity}">${d.severity}</span>`;

/** A replacement a reader can see: an invisible fix shows as its name, not as nothing. */
const showFix = (fix) => [...fix].map((ch) => NAMED.get(ch) ?? ch).join(' ') || '(delete)';

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
  <div class="opts">
    ${g.options
      .map(
        (o) =>
          `<label><input type="radio" name="${id}" value="${esc(o)}"> <span>${esc(o)}</span></label>`,
      )
      .join('\n    ')}
  </div>
  <div class="note-l"><input class="note" data-for="${id}" placeholder="note (optional) — what should it be, and why?"></div>
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

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>gege-linter spot check</title>
<style>
 :root{--bg:#0d1017;--panel:#161a24;--fg:#e8ecf4;--dim:#94a0b8;--accent:#7aa2f7;
   --rule:#252b38;--ok:#7bd88f;--warn:#e0af68;--bad:#f7768e;--info:#7dcfff}
 *{box-sizing:border-box}
 body{margin:0;background:var(--bg);color:var(--fg);padding:40px 22px 150px;
   font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
   max-width:1080px;margin-inline:auto}
 h1{font-size:1.7rem;margin:0 0 .2em}
 h2{font-size:1.15rem;margin:2.4em 0 .3em;border-bottom:1px solid var(--rule);
   padding-bottom:.3em;display:flex;align-items:baseline;gap:.7em}
 .pool{font-size:.72rem;font-weight:400;color:var(--dim);letter-spacing:.02em}
 .sub{color:var(--dim);margin:0 0 1.6em;font-size:.94rem;max-width:78ch}
 .lede{color:var(--dim);font-size:.95rem;max-width:78ch}
 .lede code{color:#f0d68a}
 .card{background:var(--panel);border-radius:11px;padding:20px 22px;margin:14px 0}
 .head{margin:0 0 .5em}
 .qid{background:#243049;color:#9dbcf5;border-radius:6px;padding:2px 9px;
   font-size:.75rem;font-weight:700;letter-spacing:.05em}
 code{background:#0b0d12;padding:1px 6px;border-radius:4px;font-size:.85em;color:#b9c6e0}
 .cy{color:#f0d68a;font-weight:600;font-size:1.05rem;margin-left:.4em}
 .diags{list-style:none;margin:.4em 0 .2em;padding:0;font-size:.87rem}
 .diags li{padding:7px 10px;border-radius:7px;border:1px solid transparent;margin-bottom:4px;
   color:var(--dim)}
 .diags li.primary{background:#1b2130;border-color:var(--rule);color:var(--fg)}
 .diags .msg{margin-left:.35em}
 .diags .at{color:var(--dim);font-size:.82em;margin-left:.35em;white-space:nowrap}
 .none{color:var(--dim);font-size:.87rem;margin:.4em 0}
 .sev{display:inline-block;border-radius:5px;padding:1px 7px;font-size:.7rem;font-weight:700;
   text-transform:uppercase;letter-spacing:.04em}
 .s-error{background:#3a1e26;color:var(--bad)}
 .s-warning{background:#3a2f1c;color:var(--warn)}
 .s-info{background:#1c2f3a;color:var(--info)}
 .scripts{display:flex;flex-wrap:wrap;gap:16px;margin:1.1em 0 1.1em}
 .sbox{margin:0;background:#0c0e14;border:1px solid var(--rule);border-radius:9px;
   padding:16px 14px;display:flex;flex-direction:column;align-items:center;gap:12px;min-width:150px}
 .scripts.wide .sbox{width:100%;align-items:flex-start}
 .mn{writing-mode:vertical-lr;text-orientation:mixed;
   font-family:"Noto Sans Mongolian","Mongolian Baiti","MN Baiti","Menksoft Qagan",serif;
   font-size:2.1rem;line-height:1.5;min-height:150px;color:#fff}
 .scripts.wide .mn{max-height:52vh;overflow-x:auto;width:100%}
 .sbox figcaption{font-size:.76rem;color:var(--dim);text-align:center;max-width:200px;line-height:1.45}
 .scripts.wide figcaption{text-align:left;max-width:none}
 .cps{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:.35em 0}
 .cpl{color:var(--dim);font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;
   width:52px;flex:none}
 .cpc{background:#0b0d12;border:1px solid #1c2230;border-radius:4px;padding:1px 5px;
   font:.68rem ui-monospace,SFMono-Regular,Menlo,monospace;color:#8f9cb5}
 .cpc.inv{color:#c6b17a}
 .cpc.hit{background:#3a2f1c;border-color:#6b5525;color:#ffd79a}
 .cpc em{font-style:normal;opacity:.75;margin-left:4px}
 .opts{display:flex;flex-direction:column;gap:7px;margin-top:.9em}
 .opts label{display:flex;align-items:center;gap:9px;cursor:pointer;padding:7px 11px;
   border-radius:7px;border:1px solid transparent;font-size:.93rem}
 .opts label:hover{background:#1e2331;border-color:var(--rule)}
 .opts input[type=radio]{accent-color:var(--accent);width:16px;height:16px;flex:none}
 .note-l{margin-top:4px}
 .note{width:100%;background:#0b0d12;border:1px solid var(--rule);border-radius:6px;
   color:var(--fg);padding:7px 10px;font-size:.88rem;font-family:inherit}
 .note:focus{outline:none;border-color:var(--accent)}
 #out{position:fixed;left:0;right:0;bottom:0;background:#0a0c11;border-top:2px solid var(--accent);
   padding:12px 20px;box-shadow:0 -8px 28px rgba(0,0,0,.6)}
 #out .row{display:flex;gap:12px;align-items:center;max-width:1080px;margin:0 auto}
 #answers{flex:1;background:#0f1218;border:1px solid var(--rule);border-radius:7px;color:var(--fg);
   font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.8rem;padding:9px 11px;
   height:74px;resize:vertical;white-space:pre;overflow:auto}
 button{background:var(--accent);color:#0a1020;border:0;border-radius:7px;padding:11px 18px;
   font-weight:700;cursor:pointer;font-size:.9rem;white-space:nowrap;font-family:inherit}
 button:hover{filter:brightness(1.1)}
 .count{color:var(--dim);font-size:.8rem;white-space:nowrap}
</style></head><body>

<h1>Lint spot check</h1>
<p class="lede">A random draw from <strong>${corpusLine}</strong> of real, unrepaired
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
<code>node scripts/build-spotcheck.mjs --seed ${SEED}</code></p>

${sections}

<div id="out"><div class="row">
  <textarea id="answers" readonly placeholder="Make a selection above…"></textarea>
  <div style="display:flex;flex-direction:column;gap:6px;align-items:center">
    <button id="copy">Copy</button>
    <span class="count" id="count">0 answered</span>
  </div>
</div></div>

<script>
const IDS = ${JSON.stringify(allIds)};
const LABEL = ${JSON.stringify(labels)};
const SEED = ${JSON.stringify(String(SEED))};
function build() {
  const lines = [];
  let n = 0;
  for (const id of IDS) {
    const sel = document.querySelector('input[name="' + id + '"]:checked');
    const note = document.querySelector('.note[data-for="' + id + '"]');
    const noteVal = note && note.value.trim();
    if (!sel && !noteVal) continue;
    n++;
    let line = id + ' (' + LABEL[id] + '): ' + (sel ? sel.value : '(no option picked)');
    if (noteVal) line += ' — NOTE: ' + noteVal;
    lines.push(line);
  }
  const ta = document.getElementById('answers');
  ta.value = lines.length ? 'LINT SPOT CHECK ANSWERS (seed ' + SEED + ')\\n' + lines.join('\\n') : '';
  document.getElementById('count').textContent = n + ' of ' + IDS.length + ' answered';
}
document.addEventListener('change', build);
document.addEventListener('input', build);
document.getElementById('copy').addEventListener('click', async () => {
  const ta = document.getElementById('answers');
  if (!ta.value) return;
  try { await navigator.clipboard.writeText(ta.value); }
  catch {
    ta.removeAttribute('readonly'); ta.select(); document.execCommand('copy');
    ta.setAttribute('readonly', '');
  }
  const b = document.getElementById('copy');
  b.textContent = 'Copied';
  setTimeout(() => { b.textContent = 'Copy'; }, 1400);
});
build();
</script>
</body></html>
`;

writeFileSync(resolve(ROOT, OUT), html);
const sidecar = OUT.replace(/\.html?$/, '') + '.json';
writeFileSync(resolve(ROOT, sidecar), `${JSON.stringify({ seed: SEED, asked }, null, 2)}\n`);

console.log(`wrote ${OUT}  (seed ${SEED}, ${allIds.length} items)`);
console.log(`wrote ${sidecar}  (what each id asked, for grading the answers)`);
for (const g of GROUPS) {
  console.log(`  ${g.title.padEnd(26)} ${String(g.items.length).padStart(2)} of ${g.candidates}`);
}
