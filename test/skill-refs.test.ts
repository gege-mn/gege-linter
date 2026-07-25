import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const docsDir = join(import.meta.dirname, '..', 'docs');
const refsDir = join(import.meta.dirname, '..', 'skills', 'mongol-bichig', 'references');

// docs/ is the source of truth; the skill ships a mirror so `npx skills add`
// installs are self-contained. Drift here means someone edited one side only.
describe('skill references mirror docs/', () => {
  const docs = readdirSync(docsDir).filter((f) => f.endsWith('.md'));

  it('mirrors every doc (run `pnpm sync:skills` after editing docs/)', () => {
    expect(
      readdirSync(refsDir)
        .filter((f) => f.endsWith('.md'))
        .sort(),
    ).toEqual(docs.sort());
  });

  for (const file of docs) {
    it(`references/${file} matches docs/${file}`, () => {
      expect(readFileSync(join(refsDir, file), 'utf8')).toBe(
        readFileSync(join(docsDir, file), 'utf8'),
      );
    });
  }
});
