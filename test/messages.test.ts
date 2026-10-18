import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import {
  codes,
  type Diagnostic,
  formalRules,
  fusableStack,
  lint,
  locales,
  localize,
  type MessageId,
  messages,
  rules,
} from '../src/index.js';
import { messageSamples } from './fixtures/message-samples.js';

const ids = Object.keys(messages.en) as MessageId[];
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('message catalogs', () => {
  it.each(locales)('%s translates every message with the same placeholders', (locale) => {
    expect(Object.keys(messages[locale]).sort()).toEqual([...ids].sort());
    for (const id of ids)
      expect(placeholders(messages[locale][id]), id).toEqual(placeholders(messages.en[id]));
  });

  it.each(locales)('%s carries no connector, selector or joiner', (locale) => {
    // A translator's paste is exactly how an NNBSP or MVS sneaks in unseen.
    for (const id of ids)
      expect(messages[locale][id], id).not.toMatch(/[\u180b-\u180f\u202f]|\u200c|\u200d/);
  });

  it('has a sample that triggers every message, and nothing but it', () => {
    for (const id of ids) {
      const { rule, mode, text } = messageSamples[id];
      const active = mode === 'formal' ? formalRules : [...rules, fusableStack];
      expect(
        lint(
          text,
          active.filter((r) => r.name === rule),
        ).map((d) => d.messageId),
        id,
      ).toEqual([id]);
    }
  });
});

describe('codes', () => {
  it('gives every message a GL code whose rule number is its rule’s alone', () => {
    const ruleOf = new Map<string, string>();
    for (const id of ids) {
      const code = codes[id];
      expect(code, id).toMatch(/^GL\d{4}$/);
      const rule = id.split('/')[0] as string;
      const prefix = code.slice(0, 4);
      expect(ruleOf.get(prefix) ?? rule, id).toBe(rule);
      ruleOf.set(prefix, rule);
    }
  });

  it('shares a code only between the wordings of one finding', () => {
    const seen = new Map<string, MessageId[]>();
    for (const id of ids) seen.set(codes[id], [...(seen.get(codes[id]) ?? []), id]);
    const shared = [...seen.values()].filter((group) => group.length > 1);
    expect(shared).toEqual([['no-pua/one', 'no-pua/many']]);
  });

  it('puts the code on every diagnostic, and in the CLI line', () => {
    for (const id of ids) {
      const { rule, mode, text } = messageSamples[id];
      const active = mode === 'formal' ? formalRules : [...rules, fusableStack];
      expect(
        lint(
          text,
          active.filter((r) => r.name === rule),
        )[0]?.code,
        id,
      ).toBe(codes[id]);
    }
    expect(runCli(['-'], { readStdin: () => 'ᠪᠢᠳᠡᠨ\u202fᠤ' }).stdout).toContain(
      'GL0101 nnbsp-legacy',
    );
  });
});

describe('localize', () => {
  const sample = `ᠪᠢᠳᠡᠨ\u202fᠤ ᠨᠡᠷ\u180eᠽᠽᠽ \u180e`;
  const all = [...lint(sample, formalRules), ...lint(sample, rules)];

  it('gives back the English message for en', () => {
    for (const d of all) expect(localize(d, 'en')).toBe(d.message);
  });

  it('fills the data into the translation', () => {
    const unknown = all.find((d) => d.messageId === 'unknown-suffix/unknown') as Diagnostic;
    expect(localize(unknown, 'fr')).toContain('«\u00a0ᠽᠽᠽ\u00a0» après MVS');
    expect(localize(unknown, 'mn')).toContain('«ᠽᠽᠽ» MVS');
    expect(localize(unknown, 'zh-Hans')).toContain('MVS 之后');
  });

  it('keeps the message of a diagnostic from a rule outside the package', () => {
    const d: Diagnostic = { rule: 'mine', severity: 'info', message: 'mine', start: 0, end: 1 };
    expect(localize(d, 'mn')).toBe('mine');
  });
});

describe('cli --lang', () => {
  const stdin = () => 'ᠪᠢᠳᠡᠨ\u202fᠤ';

  it('prints the findings in the chosen language', () => {
    const result = runCli(['--lang', 'mn', '-'], { readStdin: stdin });
    expect(result.stdout).toContain(messages.mn['nnbsp-legacy/connector']);
    expect(runCli(['--lang=zh-Hans', '-'], { readStdin: stdin }).stdout).toContain('已过时');
  });

  it('localizes --json too, alongside the id and data', () => {
    const out = JSON.parse(runCli(['--json', '--lang', 'fr', '-'], { readStdin: stdin }).stdout);
    expect(out.files[0].diagnostics[0]).toMatchObject({
      messageId: 'nnbsp-legacy/connector',
      message: messages.fr['nnbsp-legacy/connector'],
    });
  });

  it('refuses an unknown or missing language', () => {
    expect(runCli(['--lang', 'de', '-'], { readStdin: stdin })).toMatchObject({ code: 2 });
    expect(runCli(['-', '--lang'], { readStdin: stdin })).toMatchObject({ code: 2 });
  });
});
