#!/usr/bin/env node
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { applyFixes, lint, rules } from './index.js';
import type { Diagnostic, Severity } from './types.js';

const HELP = `Usage: gege-linter [options] <file...>

Lint traditional Mongolian script (Mongol bichig) text for incorrect or
legacy Unicode usage. Reads the given files, or stdin when the file is "-".

Options:
  --fix          apply mechanical fixes (rewrites files; stdin prints to stdout)
  --json         machine-readable output (code-point offsets plus line/col)
  --list-rules   print the built-in rule names and exit
  -h, --help     show this help
  -v, --version  print the version

Exit codes: 0 clean or warnings only · 1 error-severity findings · 2 usage or I/O failure`;

interface CliOptions {
  fix: boolean;
  json: boolean;
  listRules: boolean;
  help: boolean;
  version: boolean;
  files: string[];
}

function parseArgs(argv: readonly string[]): CliOptions | { error: string } {
  const opts: CliOptions = {
    fix: false,
    json: false,
    listRules: false,
    help: false,
    version: false,
    files: [],
  };
  let onlyFiles = false;
  for (const arg of argv) {
    if (onlyFiles || arg === '-' || !arg.startsWith('-')) {
      opts.files.push(arg);
    } else if (arg === '--') {
      onlyFiles = true;
    } else if (arg === '--fix') {
      opts.fix = true;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--list-rules') {
      opts.listRules = true;
    } else if (arg === '-h' || arg === '--help') {
      opts.help = true;
    } else if (arg === '-v' || arg === '--version') {
      opts.version = true;
    } else {
      return { error: `unknown option: ${arg}` };
    }
  }
  return opts;
}

/** Code-point offsets of each line start (lines split on U+000A). */
function lineStarts(cps: readonly string[]): number[] {
  const starts = [0];
  for (let i = 0; i < cps.length; i++) {
    if (cps[i] === '\n') starts.push(i + 1);
  }
  return starts;
}

/** 1-based line and code-point column for a code-point offset. */
function locate(starts: readonly number[], offset: number): { line: number; col: number } {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((starts[mid] ?? 0) <= offset) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo + 1, col: offset - (starts[lo] ?? 0) + 1 };
}

const SEVERITY_SGR: Record<Severity, string> = { error: '31', warning: '33', info: '36' };

/** Strip C0 controls and DEL so hostile file names can't inject terminal escapes. */
const scrubControls = (s: string) => [...s].filter((c) => c >= ' ' && c !== '\u007F').join('');

interface FileReport {
  path: string;
  diagnostics: (Diagnostic & { line: number; col: number })[];
  fixed: number;
}

function report(
  path: string,
  text: string,
  opts: CliOptions,
): { entry: FileReport; output: string } {
  let diagnostics = lint(text);
  let output = text;
  let fixed = 0;
  if (opts.fix) {
    const applied = applyFixes(text, diagnostics);
    if (applied !== text) {
      fixed = diagnostics.filter((d) => d.fix !== undefined).length;
      output = applied;
      diagnostics = lint(applied);
    }
  }
  const starts = lineStarts([...output]);
  const entry: FileReport = {
    path,
    diagnostics: diagnostics.map((d) => ({ ...d, ...locate(starts, d.start) })),
    fixed,
  };
  return { entry, output };
}

function formatHuman(entries: readonly FileReport[], color: boolean): string {
  const paint = (sgr: string, s: string) => (color ? `\u001B[${sgr}m${s}\u001B[0m` : s);
  const lines: string[] = [];
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  let fixable = 0;
  let fixed = 0;
  for (const entry of entries) {
    fixed += entry.fixed;
    if (entry.diagnostics.length === 0) continue;
    lines.push(paint('4', scrubControls(entry.path)));
    for (const d of entry.diagnostics) {
      if (d.severity === 'error') errors++;
      else if (d.severity === 'warning') warnings++;
      else infos++;
      if (d.fix !== undefined) fixable++;
      const loc = paint('2', `${d.line}:${d.col}`);
      const sev = paint(SEVERITY_SGR[d.severity], d.severity.padEnd(7));
      const tail = d.fix !== undefined ? ` ${paint('2', '[fixable]')}` : '';
      lines.push(`  ${loc}  ${sev}  ${d.message}  ${paint('2', d.rule)}${tail}`);
    }
    lines.push('');
  }
  const problems = errors + warnings + infos;
  const summary: string[] = [];
  if (problems > 0) {
    const parts = [
      errors > 0 ? `${errors} error${errors === 1 ? '' : 's'}` : '',
      warnings > 0 ? `${warnings} warning${warnings === 1 ? '' : 's'}` : '',
      infos > 0 ? `${infos} info` : '',
    ].filter((p) => p !== '');
    const sgr = errors > 0 ? '31' : '33';
    summary.push(
      paint(sgr, `✖ ${problems} problem${problems === 1 ? '' : 's'} (${parts.join(', ')})`),
    );
    if (fixable > 0) summary.push(paint('2', `  ${fixable} fixable with --fix`));
  }
  if (fixed > 0) summary.push(paint('32', `✔ fixed ${fixed}`));
  return [...lines, ...summary].join('\n');
}

export interface CliIo {
  color?: boolean;
  readStdin?: () => string;
}

export interface CliResult {
  code: 0 | 1 | 2;
  stdout: string;
  stderr: string;
  /** stdout is verbatim data (fixed stdin text) — print without a trailing newline. */
  raw?: boolean;
}

export function runCli(argv: readonly string[], io: CliIo = {}): CliResult {
  const opts = parseArgs(argv);
  if ('error' in opts)
    return { code: 2, stdout: '', stderr: `gege-linter: ${opts.error}\n${HELP}` };
  if (opts.help) return { code: 0, stdout: HELP, stderr: '' };
  if (opts.version) {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
      version: string;
    };
    return { code: 0, stdout: pkg.version, stderr: '' };
  }
  if (opts.listRules) return { code: 0, stdout: rules.map((r) => r.name).join('\n'), stderr: '' };
  if (opts.files.length === 0) return { code: 2, stdout: '', stderr: HELP };
  const usesStdin = opts.files.includes('-');
  if (usesStdin && opts.fix && opts.json) {
    return { code: 2, stdout: '', stderr: 'gege-linter: --fix --json cannot combine with stdin' };
  }

  const entries: FileReport[] = [];
  const ioErrors: string[] = [];
  let stdinOutput = '';
  for (const path of opts.files) {
    let text: string;
    try {
      text =
        path === '-'
          ? (io.readStdin ?? (() => readFileSync(0, 'utf8')))()
          : readFileSync(path, 'utf8');
    } catch (e) {
      ioErrors.push(
        scrubControls(
          `gege-linter: cannot read ${path}: ${e instanceof Error ? e.message : String(e)}`,
        ),
      );
      continue;
    }
    const { entry, output } = report(path === '-' ? '<stdin>' : path, text, opts);
    entries.push(entry);
    if (path === '-') {
      stdinOutput = output;
    } else if (opts.fix && output !== text) {
      try {
        writeFileSync(path, output);
      } catch (e) {
        ioErrors.push(
          scrubControls(
            `gege-linter: cannot write ${path}: ${e instanceof Error ? e.message : String(e)}`,
          ),
        );
      }
    }
  }

  const errors = entries.reduce(
    (n, e) => n + e.diagnostics.filter((d) => d.severity === 'error').length,
    0,
  );
  const code = ioErrors.length > 0 ? 2 : errors > 0 ? 1 : 0;

  if (opts.json) {
    const summary = {
      errors,
      warnings: entries.reduce(
        (n, e) => n + e.diagnostics.filter((d) => d.severity === 'warning').length,
        0,
      ),
      infos: entries.reduce(
        (n, e) => n + e.diagnostics.filter((d) => d.severity === 'info').length,
        0,
      ),
      fixable: entries.reduce(
        (n, e) => n + e.diagnostics.filter((d) => d.fix !== undefined).length,
        0,
      ),
      fixed: entries.reduce((n, e) => n + e.fixed, 0),
    };
    return {
      code,
      stdout: JSON.stringify({ files: entries, summary }, null, 2),
      stderr: ioErrors.join('\n'),
    };
  }

  const human = formatHuman(entries, io.color ?? false);
  // stdin --fix owns stdout for the fixed text; findings go to stderr so pipes stay clean.
  if (usesStdin && opts.fix) {
    return {
      code,
      stdout: stdinOutput,
      stderr: [human, ...ioErrors].filter((s) => s !== '').join('\n'),
      raw: true,
    };
  }
  return { code, stdout: human, stderr: ioErrors.join('\n') };
}

const directRun =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;

if (directRun) {
  const result = runCli(process.argv.slice(2), {
    color: process.stdout.isTTY === true && process.env.NO_COLOR === undefined,
  });
  if (result.stdout !== '')
    process.stdout.write(result.raw === true ? result.stdout : `${result.stdout}\n`);
  if (result.stderr !== '') process.stderr.write(`${result.stderr}\n`);
  process.exitCode = result.code;
}
