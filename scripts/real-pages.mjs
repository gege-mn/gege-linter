/*
 * Lints live bichig pages and prints what the rules find, for a person to read before a
 * release. Not a test: the pages change. Run: bun run build && bun run real-pages
 */
import { applyFixes, lint } from '../dist/index.js';

const PAGES = [
  'https://news.mn/mng/',
  'https://nationallibrary.mn/mng/',
  'https://gov.mn/mng',
  'https://wikibilig.mn/',
  'https://mongols.co/',
  'https://www.mongol-bichig.com/',
  'https://mof.gov.mn/mng',
  'https://mongolian-script.blogspot.com/',
];
const RULES = ['space-before-suffix', 'ii-before-final-ae', 'fvs-unregistered'];
const MAX_PASSES = 3;

const tally = new Map();
const problems = [];

for (const page of PAGES) {
  let html;
  try {
    const res = await fetch(page, { signal: AbortSignal.timeout(20_000) });
    html = await res.text();
  } catch {
    console.log(`unreachable  ${page}`);
    continue;
  }
  const text = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const runs = text.match(/[\u1800-\u18AF\u202F][\u1800-\u18AF\u202F ]*/g) ?? [];
  console.log(`${String(runs.length).padStart(5)} runs   ${page}`);

  for (const run of runs) {
    const cps = [...run];
    for (const d of lint(run).filter((x) => RULES.includes(x.rule))) {
      const key = `${d.code} ${d.data?.suffix ?? d.data?.letter}${d.data?.n ? ` FVS${d.data.n}` : ''}`;
      const entry = tally.get(key) ?? { count: 0, sample: '' };
      entry.count++;
      entry.sample ||= cps.slice(Math.max(0, d.start - 12), d.end + 10).join('');
      tally.set(key, entry);
    }

    let fixed = run;
    for (let i = 0; i < MAX_PASSES; i++) fixed = applyFixes(fixed, lint(fixed));
    if (lint(fixed).some((d) => d.fix !== undefined))
      problems.push(`no fixed point after ${MAX_PASSES} passes: ${run.slice(0, 60)}`);
    const before = new Set(lint(run).map((d) => d.code));
    for (const d of lint(fixed))
      if (d.severity !== 'info' && !before.has(d.code))
        problems.push(`the fixes created ${d.code}: ${run.slice(0, 60)}`);
  }
}

console.log(`\n${RULES.join(', ')}, most common first. Every line should be a true hit:`);
for (const [key, { count, sample }] of [...tally].sort((a, b) => b[1].count - a[1].count))
  console.log(`${String(count).padStart(4)}  ${key}   ${sample}`);

console.log(problems.length ? `\nPROBLEMS\n${problems.join('\n')}` : '\nNo fix problems.');
process.exitCode = problems.length ? 1 : 0;
