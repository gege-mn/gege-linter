import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import { rules } from '../src/index.js';

const NNBSP = '\u202f';
const MVS = '\u180e';

// Same real pair as nnbsp-legacy.test.ts: ᠪᠢᠳᠡᠨ (stem, 5 code points) + genitive ᠤ.
const legacy = `ᠪᠢᠳᠡᠨ${NNBSP}ᠤ`;
const fixed = `ᠪᠢᠳᠡᠨ${MVS}ᠤ`;

function tmpFile(content: string): string {
  const path = join(mkdtempSync(join(tmpdir(), 'gege-linter-')), 'sample.txt');
  writeFileSync(path, content);
  return path;
}

describe('cli', () => {
  it('exits 0 with no output on a clean file', () => {
    const result = runCli([tmpFile(fixed)]);
    expect(result).toMatchObject({ code: 0, stdout: '', stderr: '' });
  });

  it('reports diagnostics with 1-based line:col in code points', () => {
    const result = runCli([tmpFile(`abc\n${legacy}`)]);
    expect(result.code).toBe(0); // warnings only
    expect(result.stdout).toContain('2:6');
    expect(result.stdout).toContain('warning');
    expect(result.stdout).toContain('nnbsp-legacy');
    expect(result.stdout).toContain('[fixable]');
    expect(result.stdout).toContain('1 problem');
    expect(result.stdout).toContain('1 fixable with --fix');
  });

  it('exits 1 when an error-severity diagnostic is found', () => {
    const result = runCli([tmpFile(MVS)]);
    expect(result.code).toBe(1);
    expect(result.stdout).toContain('mvs-context');
  });

  it('--fix rewrites the file and reports the fix count', () => {
    const path = tmpFile(legacy);
    const result = runCli(['--fix', path]);
    expect(result.code).toBe(0);
    expect(readFileSync(path, 'utf8')).toBe(fixed);
    expect(result.stdout).toContain('fixed 1');
  });

  it('--json emits offsets, line/col, and a summary', () => {
    const result = runCli(['--json', tmpFile(legacy)]);
    const parsed = JSON.parse(result.stdout) as {
      files: {
        path: string;
        diagnostics: { rule: string; start: number; line: number; col: number }[];
      }[];
      summary: { errors: number; warnings: number; fixable: number };
    };
    expect(parsed.files[0]?.diagnostics[0]).toMatchObject({
      rule: 'nnbsp-legacy',
      start: 5,
      line: 1,
      col: 6,
    });
    expect(parsed.summary).toMatchObject({ errors: 0, warnings: 1, fixable: 1 });
  });

  it('reads stdin as "-"', () => {
    const result = runCli(['-'], { readStdin: () => legacy });
    expect(result.stdout).toContain('<stdin>');
    expect(result.stdout).toContain('nnbsp-legacy');
  });

  it('--fix on stdin writes the fixed text verbatim to stdout', () => {
    const result = runCli(['--fix', '-'], { readStdin: () => legacy });
    expect(result.stdout).toBe(fixed);
    expect(result.raw).toBe(true);
    expect(result.stderr).toContain('fixed 1');
  });

  it('--fix on stdin echoes already-clean input unchanged', () => {
    const result = runCli(['--fix', '-'], { readStdin: () => fixed });
    expect(result.stdout).toBe(fixed);
    expect(result.code).toBe(0);
  });

  it('exits 2 on an unreadable file but still lints the others', () => {
    const result = runCli([join(tmpdir(), 'gege-linter-definitely-missing.txt'), tmpFile(legacy)]);
    expect(result.code).toBe(2);
    expect(result.stderr).toContain('cannot read');
    expect(result.stdout).toContain('nnbsp-legacy');
  });

  it('refuses a file that is not valid UTF-8, and --fix leaves its bytes alone', () => {
    // Decoding with 'utf8' turns every invalid byte into U+FFFD; writing that
    // back would destroy bytes the linter never diagnosed, and report success.
    const bytes = Buffer.concat([Buffer.from(legacy, 'utf8'), Buffer.from([0xc3, 0x28, 0xff])]);
    const path = join(mkdtempSync(join(tmpdir(), 'gege-linter-')), 'latin1.txt');
    writeFileSync(path, bytes);

    const result = runCli(['--fix', path]);
    expect(result.code).toBe(2);
    expect(result.stderr).toContain('not valid UTF-8');
    expect(readFileSync(path).equals(bytes)).toBe(true);
  });

  it('--list-rules keeps stdout a bare list and notes the opt-in rule on stderr', () => {
    const result = runCli(['--list-rules']);
    // stdout is the contract a script reads: one rule name per line, nothing
    // else. fusableStack is not in `rules` and the CLI never runs it, so the
    // mention that it exists goes to stderr instead.
    expect(result.stdout.split('\n')).toEqual(rules.map((r) => r.name));
    expect(result.stderr).toContain('fusable-stack');
    expect(result.code).toBe(0);
  });

  it('rejects unknown options with exit 2', () => {
    expect(runCli(['--nope']).code).toBe(2);
  });

  it('--help exits 0 with usage', () => {
    const result = runCli(['--help']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Usage: gege-linter');
  });
});
