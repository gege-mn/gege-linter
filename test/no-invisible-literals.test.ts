import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

// What CLAUDE.md forbids as a literal, plus NBSP and the Private Use Area:
// each looks like nothing, or like something else, in an editor.
const INVISIBLE = /\u00a0|[\u180b-\u180f]|\u200c|\u200d|\u202f|[\ue000-\uf8ff]/u;

const sources = ['src', 'test', 'scripts'].flatMap((dir) =>
  readdirSync(join(ROOT, dir), { recursive: true, encoding: 'utf8' })
    .filter((f) => /\.(ts|mjs)$/.test(f))
    .map((f) => join(dir, f)),
);

describe('source files', () => {
  it.each(sources)('%s writes invisible characters as \\u escapes', (file) => {
    const lines = readFileSync(join(ROOT, file), 'utf8').split('\n');
    const hits = lines.flatMap((line, i) => (INVISIBLE.test(line) ? [i + 1] : []));
    expect(hits, 'lines with an invisible literal').toEqual([]);
  });
});
