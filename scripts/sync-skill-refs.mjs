// Mirror docs/*.md into skills/mongol-bichig/references/ so the skill ships
// self-contained via `npx skills add`. docs/ is the single source of truth;
// test/skill-refs.test.ts fails CI when the mirror drifts.
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const docsDir = join(root, 'docs');
const refsDir = join(root, 'skills', 'mongol-bichig', 'references');

// Read the source before touching the mirror — a missing docs/ must not
// leave references/ deleted.
const files = readdirSync(docsDir).filter((f) => f.endsWith('.md'));

rmSync(refsDir, { recursive: true, force: true });
mkdirSync(refsDir, { recursive: true });
for (const file of files) {
  copyFileSync(join(docsDir, file), join(refsDir, file));
}
process.stdout.write(`synced ${files.length} reference docs to skills/mongol-bichig/references/\n`);
