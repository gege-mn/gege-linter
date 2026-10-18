import type { Diagnostic } from '../types.js';
import { codes } from './codes.js';
import { en } from './en.js';
import { fr } from './fr.js';
import { mn } from './mn.js';
import { zhHans } from './zh-Hans.js';

export type MessageId = keyof typeof en;

/** A translation of every message, with the same placeholders as `en`. */
export type Catalog = Readonly<Record<MessageId, string>>;

type Placeholders<S extends string> = S extends `${string}{${infer P}}${infer R}`
  ? P | Placeholders<R>
  : never;

export type MessageData<K extends MessageId> = Readonly<
  Record<Placeholders<(typeof en)[K]>, string | number>
>;

export const locales = ['en', 'mn', 'zh-Hans', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const messages: Readonly<Record<Locale, Catalog>> = {
  en,
  mn,
  'zh-Hans': zhHans,
  fr,
};

export const isLocale = (s: string): s is Locale => (locales as readonly string[]).includes(s);

const format = (template: string, data: Readonly<Record<string, string | number>>): string =>
  template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in data ? String(data[name]) : whole,
  );

export { codes };

/** The `code`, `message`, `messageId` and `data` of a diagnostic, for a rule to spread in. */
export function msg<K extends MessageId>(
  messageId: K,
  ...[data]: [Placeholders<(typeof en)[K]>] extends [never] ? [] : [data: MessageData<K>]
): Pick<Diagnostic, 'code' | 'message' | 'messageId' | 'data'> {
  const code = codes[messageId];
  return data === undefined
    ? { code, message: en[messageId], messageId }
    : { code, message: format(en[messageId], data), messageId, data };
}

/**
 * A diagnostic's message in `locale`. Anything this catalog cannot answer — a
 * rule outside this package, an id from another version, a locale such as
 * `navigator.language`'s `mn-MN` — keeps its own `message`.
 */
export function localize(d: Diagnostic, locale: Locale): string {
  const template = d.messageId === undefined ? undefined : messages[locale]?.[d.messageId];
  if (template === undefined) return d.message;
  return format(template, d.data ?? {});
}
