/**
 * Shared rendering for the reader-review pages.
 *
 * Both drills — the random spot check (`build-spotcheck.mjs`) and the sequence
 * check (`build-sequence-check.mjs`) — ask a bichig reader to rule on something
 * and collect the answers into one copy-pasteable block. Keeping the shell in
 * one place means the reader learns the interface once: same vertical script,
 * same code-point chips underneath, same Copy button in the same corner.
 *
 * Dev-only. Nothing here ships; `files` in package.json is still `dist` alone.
 */

export const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

/** The characters a reader cannot see, and the two letters they cannot tell apart. */
export const NAMED = new Map([
  ['\u202F', 'NNBSP'],
  ['\u180E', 'MVS'],
  ['\u180B', 'FVS1'],
  ['\u180C', 'FVS2'],
  ['\u180D', 'FVS3'],
  ['\u180F', 'FVS4'],
  ['\u180A', 'NIRUGU'],
  ['\u200D', 'ZWJ'],
  ['\u200C', 'ZWNJ'],
  [' ', 'SP'],
  ['ᢈ', 'ALI GALI KA'],
  ['ᢉ', 'ALI GALI GA'],
]);

export const uplus = (ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;

/** Code points as chips, with the interesting span marked. */
export function cpRow(text, spans) {
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

export const scriptBox = (label, text, caption) =>
  `<figure class="sbox"><div class="mn">${esc(text)}</div>
   <figcaption><strong>${esc(label)}</strong>${caption ? `<br>${esc(caption)}` : ''}</figcaption></figure>`;

/** A replacement a reader can see: an invisible fix shows as its name, not as nothing. */
export const showFix = (fix) => [...fix].map((ch) => NAMED.get(ch) ?? ch).join(' ') || '(delete)';

/** Radio options plus a free-text note, the shape every question on both pages takes. */
export const optionBlock = (id, options) =>
  `<div class="opts">
    ${options
      .map(
        (o) =>
          `<label><input type="radio" name="${id}" value="${esc(o)}"> <span>${esc(o)}</span></label>`,
      )
      .join('\n    ')}
  </div>
  <div class="note-l"><input class="note" data-for="${id}" placeholder="note (optional) — what should it be, and why?"></div>`;

const STYLE = `
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
 .count{color:var(--dim);font-size:.8rem;white-space:nowrap}`;

const EXTRA_STYLE = `
 .seqline{display:flex;flex-wrap:wrap;align-items:baseline;gap:.6em;margin:0 0 .3em}
 .seqmn{font-family:"Noto Sans Mongolian","Mongolian Baiti",serif;font-size:1.35rem;color:#fff}
 .hits{background:#2a2140;color:#c3aef0;border-radius:6px;padding:2px 9px;font-size:.72rem;
   font-weight:700;letter-spacing:.03em}
 .guess{margin:.9em 0 .2em;padding:11px 14px;border-left:2px solid #3d4a5c;background:#12161f;
   border-radius:0 7px 7px 0;font-size:.9rem;color:var(--dim)}
 .guess b{color:var(--fg);font-weight:600}
 .says{font-size:.85rem;color:var(--dim);margin:.5em 0 0}
 .exlist{display:flex;flex-wrap:wrap;gap:14px;margin:1.1em 0 .4em}
 .ex{background:#0c0e14;border:1px solid var(--rule);border-radius:9px;padding:14px 12px;
   display:flex;flex-direction:column;align-items:center;gap:10px;min-width:132px}
 .ex .mn{font-size:1.9rem;min-height:132px}
 .ex .excy{font-size:.76rem;color:var(--dim);text-align:center;max-width:170px;line-height:1.45}
 .ex .excy b{color:#f0d68a;font-weight:600}`;

/**
 * Wrap sections in the page shell. `ids` drives the answer block; `labels` maps
 * each id to the short text that identifies it in the pasted-back block.
 */
export function renderPage({ title, h1, lede, sections, ids, labels, blockTitle, extraStyle }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${STYLE}${extraStyle ? EXTRA_STYLE : ''}
</style></head><body>

<h1>${esc(h1)}</h1>
${lede}

${sections}

<div id="out"><div class="row">
  <textarea id="answers" readonly placeholder="Make a selection above…"></textarea>
  <div style="display:flex;flex-direction:column;gap:6px;align-items:center">
    <button id="copy">Copy</button>
    <span class="count" id="count">0 answered</span>
  </div>
</div></div>

<script>
const IDS = ${JSON.stringify(ids)};
const LABEL = ${JSON.stringify(labels)};
const TITLE = ${JSON.stringify(blockTitle)};
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
  ta.value = lines.length ? TITLE + '\\n' + lines.join('\\n') : '';
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
}
