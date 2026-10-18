#!/usr/bin/env node
/**
 * Build the messages review: every diagnostic message, English and Mongolian
 * side by side and both editable, each previewed with the data a real lint of
 * a real sample fills in.
 *
 * English is the source the Mongolian is translated from, so an English edit
 * flags its Mongolian for a second look, and the zh-Hans and fr catalogs are
 * shown read-only — they get redone from whatever English comes back.
 *
 * Edits survive a reload (localStorage) and come back as one JSON block of
 * just what changed.
 *
 *   pnpm build && node scripts/build-messages-review.mjs [out.html]
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cpRow, esc, STYLE } from './lib/review-page.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = process.argv[2] ?? '.tmp/messages-review.html';

const dist = resolve(ROOT, 'dist/index.js');
if (!existsSync(dist)) {
  console.error('dist/ is missing — run `pnpm build` first');
  process.exit(2);
}
const { lint, rules, formalRules, fusableStack, messages } = await import(pathToFileURL(dist).href);
// Node strips the fixture's types itself; it has only type imports.
const { messageSamples } = await import(
  pathToFileURL(resolve(ROOT, 'test/fixtures/message-samples.ts')).href
);

const rows = Object.keys(messages.en).map((id) => {
  const { rule, mode, text } = messageSamples[id];
  const active = (mode === 'formal' ? formalRules : [...rules, fusableStack]).filter(
    (r) => r.name === rule,
  );
  const d = lint(text, active).find((x) => x.messageId === id);
  if (d === undefined) throw new Error(`sample for ${id} no longer triggers it`);
  return {
    id,
    rule,
    mode,
    severity: d.severity,
    text,
    start: d.start,
    end: d.end,
    data: d.data ?? {},
    en: messages.en[id],
    mn: messages.mn[id],
    zh: messages['zh-Hans'][id],
    fr: messages.fr[id],
  };
});

/** The Mongolian terms, as the owner ruled them on 2026-10-19. `src/messages/mn.ts` follows them. */
const GLOSSARY = [
  ['suffix', 'нөхцөл'],
  ['suffix connector (MVS, NNBSP)', 'нөхцөл холбогч'],
  ['stem', 'үндэс'],
  ['attached / detached', 'залгаж бичих / салгаж бичих'],
  ['separated final a/e', 'орхиц хэлбэрийн а/э'],
  ['variation selector (FVS)', 'хувилбар сонгогч'],
  ['Private Use Area', 'Хувийн хэрэглээний муж'],
  ['code point', 'тэмдэгтийн код'],
  ['glyph encoding', 'кодчилол'],
  ['interchange / interchangeable', 'харилцан солих / харилцан солих боломжтой'],
  ['verbal ending', 'үйл үгийн төгсгөл'],
  ['formal documents', 'албан бичиг'],
  ['Hudum text', 'Худам бичвэр'],
  ['Todo · Sibe · Manchu · Ali Gali', 'тод бичиг · шивэ бичиг · манж бичиг · али-гали'],
  ['positional form', 'байрлалын хэлбэр'],
  ['joiner (ZWJ)', 'left as “ZWJ” — холбогч is taken by the suffix connector'],
  ['nirugu', 'нуруу'],
  ['space-joined particle', 'зайгаар тусгаарладаг сул үг'],
  ['compatibility character', 'нийцийн тэмдэгт'],
  ['vertical presentation form', 'босоо дүрслэлийн хэлбэр'],
  ['round-trip (GB 18030, CNS 11643)', '…-тай хөрвүүлэх зориулалттай'],
  ['core spec 13.5', 'Юникодын үндсэн стандартын 13.5'],
  ['suffix dictionary', 'нөхцлийн сан'],
  ['shaping', 'хэлбэржилт'],
  ['reflexive', 'ерөнхий хамаатуулах'],
  ['vocative', 'дуудлагын сул үг'],
  ['γ/g hiatus', 'γ/g-ээр завсарлах'],
  ['first / later syllable', 'эхний үе / удаах үе'],
  ['loanwords', 'харь үг'],
  ['analytic / fused', 'задлаг / нийлэг'],
];

const SEV = { error: 'error', warning: 'warning', info: 'info' };

const dataChips = (data) =>
  Object.entries(data)
    .map(
      ([k, v]) => `<span class="dk"><code>{${esc(k)}}</code> = <b class="bi">${esc(v)}</b></span>`,
    )
    .join('');

const card = (r) => `
<section class="card msgcard" id="${esc(r.id)}" data-id="${esc(r.id)}">
  <div class="mhead">
    <span class="qid">${esc(r.id)}</span>
    <span class="sev s-${SEV[r.severity]}">${esc(r.severity)}</span>
    ${r.mode === 'formal' ? '<span class="tag">formal mode</span>' : ''}
    <span class="flag" hidden>English changed — check the Mongolian follows</span>
    <label class="okl"><input type="checkbox" class="ok"> Mongolian OK</label>
  </div>
  <div class="sample">
    <div class="mn small">${esc(r.text)}</div>
    <div class="samplemeta">
      <div class="cps"><span class="cpl">sample</span>${cpRow(r.text, [{ start: r.start, end: r.end }])}</div>
      ${Object.keys(r.data).length ? `<div class="dks">${dataChips(r.data)}</div>` : '<div class="dks none">no placeholders</div>'}
    </div>
  </div>
  <div class="cols">
    <div class="col">
      <div class="lang">English <span class="dim">— source</span>
        <button class="reset" data-lang="en" hidden>reset</button></div>
      <textarea class="ed" data-lang="en" rows="3" spellcheck="true" lang="en">${esc(r.en)}</textarea>
      <div class="check" data-lang="en"></div>
      <div class="pv" data-lang="en"></div>
    </div>
    <div class="col">
      <div class="lang">Монгол <span class="dim">— my draft</span>
        <button class="reset" data-lang="mn" hidden>reset</button></div>
      <textarea class="ed" data-lang="mn" rows="3" spellcheck="true" lang="mn">${esc(r.mn)}</textarea>
      <div class="check" data-lang="mn"></div>
      <div class="pv" data-lang="mn"></div>
    </div>
  </div>
  <input class="note" placeholder="note (optional)">
  <details class="others"><summary>zh-Hans · fr (mine — redone from your English)</summary>
    <div class="pv other" data-src="zh"></div>
    <div class="pv other" data-src="fr"></div>
  </details>
</section>`;

const byRule = Map.groupBy(rows, (r) => r.rule);
const sections = [...byRule]
  .map(
    ([rule, rs]) =>
      `<h2>${esc(rule)} <span class="pool">${rs.length} message${rs.length > 1 ? 's' : ''}</span></h2>${rs.map(card).join('')}`,
  )
  .join('\n');

const EXTRA = `
 .msgcard{scroll-margin-top:16px}
 .mhead{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:12px}
 .tag{background:#2a2140;color:#c3aef0;border-radius:6px;padding:1px 8px;font-size:.7rem;font-weight:700}
 .flag{background:#3a2f1c;color:var(--warn);border-radius:6px;padding:1px 9px;font-size:.74rem;font-weight:600}
 .okl{margin-left:auto;display:flex;gap:6px;align-items:center;font-size:.85rem;color:var(--dim);cursor:pointer}
 .okl input{accent-color:var(--ok);width:16px;height:16px}
 .msgcard.isok{border-left:3px solid var(--ok)}
 .sample{display:flex;gap:16px;align-items:flex-start;margin-bottom:12px}
 .mn.small{font-size:1.5rem;min-height:70px;max-height:140px;background:#0c0e14;border:1px solid var(--rule);
   border-radius:8px;padding:8px 6px}
 .samplemeta{flex:1;min-width:0}
 .dks{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.85rem;margin-top:6px}
 .dks.none{color:var(--dim);font-size:.8rem}
 .bi{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans Mongolian",sans-serif;color:#f0d68a;font-weight:600}
 .cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
 @media (max-width:760px){.cols{grid-template-columns:1fr}}
 .lang{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--fg);font-weight:700;
   margin-bottom:5px;display:flex;align-items:center;gap:6px}
 .dim{color:var(--dim);font-weight:400;text-transform:none;letter-spacing:0}
 .reset{margin-left:auto;padding:2px 9px;font-size:.72rem;background:#243049;color:#9dbcf5}
 .ed{width:100%;background:#0b0d12;border:1px solid var(--rule);border-radius:7px;color:var(--fg);
   padding:9px 11px;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans Mongolian",sans-serif;
   resize:vertical;field-sizing:content;min-height:4.5em}
 .ed:focus{outline:none;border-color:var(--accent)}
 .ed.changed{border-color:#6b5525;background:#15130d}
 .check{font-size:.76rem;min-height:1.2em;margin:4px 0 2px}
 .check .bad{color:var(--bad)} .check .warn{color:var(--warn)} .check .good{color:var(--ok)}
 .pv{font-size:.88rem;color:#c9d2e3;background:#12161f;border-left:2px solid #3d4a5c;padding:7px 11px;
   border-radius:0 7px 7px 0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans Mongolian",sans-serif}
 .pv .ph{color:#f0d68a;font-weight:600}
 .pv .lost{color:var(--bad)}
 .msgcard .note{margin-top:12px}
 .others{margin-top:10px;font-size:.82rem;color:var(--dim)}
 .others summary{cursor:pointer}
 .others .pv{margin-top:6px}
 .gloss{columns:2 320px;column-gap:28px;font-size:.88rem;margin:.6em 0 0;padding:0;list-style:none}
 .gloss li{break-inside:avoid;padding:3px 0;border-bottom:1px solid var(--rule)}
 .gloss .ge{color:var(--dim)}
 .toolbar{display:flex;gap:16px;align-items:center;font-size:.85rem;color:var(--dim);margin:1.2em 0 0}
 .toolbar label{display:flex;gap:6px;align-items:center;cursor:pointer}
 body.only-open .msgcard.isok{display:none}`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Linter Messages Review</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mongolian&display=swap" rel="stylesheet">
<style>${STYLE}${EXTRA}
</style></head><body>

<h1>Linter messages — English + Монгол</h1>
<p class="lede">All ${rows.length} diagnostic messages. <b>English is the source</b>: edit it freely, and the
Mongolian on that card gets flagged so it follows. The Mongolian is my draft — overwrite anything.
Keep the <code>{placeholders}</code>: the rule fills them in, and the preview under each box shows them
filled with the values a real lint of the sample produced. A placeholder can be dropped (flagged
amber), but not invented (red). zh-Hans and fr are mine; I redo them from your final English.
Everything you type is kept if you close the tab; the block at the bottom is what to paste back.</p>

<div class="card"><strong>Terms I chose in the Mongolian</strong>
<span class="dim" style="font-size:.85rem"> — if one is wrong, say so once in any note and I'll change it everywhere.</span>
<ul class="gloss">${GLOSSARY.map(([e, m]) => `<li><span class="ge">${esc(e)}</span> → ${esc(m)}</li>`).join('')}</ul></div>

<div class="toolbar">
  <label><input type="checkbox" id="onlyOpen"> hide cards marked OK</label>
  <button id="resetAll" class="reset" style="margin-left:0">reset everything</button>
</div>

${sections}

<div id="out"><div class="row">
  <textarea id="answers" readonly placeholder="Edit a message or tick OK above…"></textarea>
  <div style="display:flex;flex-direction:column;gap:6px;align-items:center">
    <button id="copy">Copy</button>
    <span class="count" id="count"></span>
  </div>
</div></div>

<script>
const ROWS = ${JSON.stringify(rows).replace(/</g, '\\u003c')};
const KEY = 'gege-linter/messages-review/v1';
const byId = Object.fromEntries(ROWS.map((r) => [r.id, r]));
let state = { en: {}, mn: {}, ok: {}, notes: {} };
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) state = Object.assign(state, s); } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

const escH = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const names = (t) => [...new Set([...t.matchAll(/\\{(\\w+)\\}/g)].map((m) => m[1]))];
function preview(t, data) {
  return escH(t).replace(/\\{(\\w+)\\}/g, (w, k) =>
    k in data ? '<span class="ph">' + escH(data[k]) + '</span>' : '<span class="lost">' + w + '</span>');
}
function check(t, r) {
  const have = names(t);
  const known = Object.keys(r.data);
  const unknown = have.filter((k) => !known.includes(k));
  const missing = known.filter((k) => !have.includes(k));
  if (unknown.length) return '<span class="bad">✗ no such placeholder: ' + unknown.map((k) => '{' + k + '}').join(' ') + '</span>';
  if (missing.length) return '<span class="warn">drops ' + missing.map((k) => '{' + k + '}').join(' ') + '</span>';
  return known.length ? '<span class="good">✓ placeholders</span>' : '';
}
const current = (lang, id) => state[lang][id] ?? byId[id][lang];

function paint(card) {
  const id = card.dataset.id;
  const r = byId[id];
  for (const lang of ['en', 'mn']) {
    const t = current(lang, id);
    const changed = id in state[lang];
    card.querySelector('.ed[data-lang=' + lang + ']').classList.toggle('changed', changed);
    card.querySelector('.reset[data-lang=' + lang + ']').hidden = !changed;
    card.querySelector('.check[data-lang=' + lang + ']').innerHTML = check(t, r);
    card.querySelector('.pv[data-lang=' + lang + ']').innerHTML = preview(t, r.data);
  }
  card.querySelector('.flag').hidden = !(id in state.en) || (id in state.mn) || state.ok[id];
  card.querySelector('.ok').checked = !!state.ok[id];
  card.classList.toggle('isok', !!state.ok[id]);
  card.querySelector('.note').value = state.notes[id] ?? '';
  card.querySelector('[data-src=zh]').innerHTML = '<b>zh-Hans</b> ' + preview(r.zh, r.data);
  card.querySelector('[data-src=fr]').innerHTML = '<b>fr</b> ' + preview(r.fr, r.data);
}

function out() {
  const pick = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v !== false));
  const res = {};
  if (Object.keys(state.en).length) res.en = state.en;
  if (Object.keys(state.mn).length) res.mn = state.mn;
  const ok = ROWS.map((r) => r.id).filter((id) => state.ok[id]);
  if (ok.length) res.mnOk = ok;
  const notes = pick(state.notes);
  if (Object.keys(notes).length) res.notes = notes;
  const n = (k) => Object.keys(state[k]).length;
  document.getElementById('answers').value = Object.keys(res).length
    ? 'gege-linter messages review\\n' + JSON.stringify(res, null, 2) : '';
  document.getElementById('count').textContent =
    n('en') + ' en · ' + n('mn') + ' mn edits · ' + ok.length + '/' + ROWS.length + ' OK';
}

const cards = [...document.querySelectorAll('.msgcard')];
for (const card of cards) {
  const id = card.dataset.id;
  for (const ed of card.querySelectorAll('.ed')) {
    const lang = ed.dataset.lang;
    if (id in state[lang]) ed.value = state[lang][id];
    ed.addEventListener('input', () => {
      if (ed.value === byId[id][lang]) delete state[lang][id]; else state[lang][id] = ed.value;
      save(); paint(card); out();
    });
  }
  for (const b of card.querySelectorAll('.reset')) {
    b.addEventListener('click', () => {
      const lang = b.dataset.lang;
      delete state[lang][id];
      card.querySelector('.ed[data-lang=' + lang + ']').value = byId[id][lang];
      save(); paint(card); out();
    });
  }
  card.querySelector('.ok').addEventListener('change', (e) => {
    if (e.target.checked) state.ok[id] = true; else delete state.ok[id];
    save(); paint(card); out();
  });
  card.querySelector('.note').addEventListener('input', (e) => {
    state.notes[id] = e.target.value; save(); out();
  });
  paint(card);
}
out();

document.getElementById('onlyOpen').addEventListener('change', (e) =>
  document.body.classList.toggle('only-open', e.target.checked));
document.getElementById('resetAll').addEventListener('click', () => {
  if (!confirm('Discard every edit, OK and note on this page?')) return;
  state = { en: {}, mn: {}, ok: {}, notes: {} };
  save();
  for (const card of cards) {
    for (const ed of card.querySelectorAll('.ed')) ed.value = byId[card.dataset.id][ed.dataset.lang];
    paint(card);
  }
  out();
});
document.getElementById('copy').addEventListener('click', async () => {
  const ta = document.getElementById('answers');
  if (!ta.value) return;
  try { await navigator.clipboard.writeText(ta.value); }
  catch { ta.removeAttribute('readonly'); ta.select(); document.execCommand('copy'); ta.setAttribute('readonly', ''); }
  const b = document.getElementById('copy');
  b.textContent = 'Copied';
  setTimeout(() => { b.textContent = 'Copy'; }, 1400);
});
</script>
</body></html>
`;

// .tmp/ is gitignored, so it is absent on a fresh clone.
mkdirSync(dirname(resolve(ROOT, OUT)), { recursive: true });
writeFileSync(resolve(ROOT, OUT), html);
console.log(`wrote ${OUT} — ${rows.length} messages`);
