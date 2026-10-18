import type { MessageId } from './messages/index.js';

/** How urgently a finding needs attention. */
export type Severity = 'error' | 'warning' | 'info';

/** One finding, positioned in Unicode code points (not UTF-16 units). */
export interface Diagnostic {
  /** Rule that produced this finding, e.g. `nnbsp-legacy`. */
  rule: string;
  /** Language-neutral and permanent, e.g. `GL0101`; see `codes`. */
  code?: string;
  severity: Severity;
  /** In English; `localize` gives it in another locale. */
  message: string;
  /** Which catalog entry `message` is, e.g. `nnbsp-legacy/connector`. */
  messageId?: MessageId;
  /** The values filled into the entry's placeholders. */
  data?: Readonly<Record<string, string | number>>;
  /** Start offset into the input, counted in code points. */
  start: number;
  /** End offset (exclusive), counted in code points. */
  end: number;
  /** Mechanical replacement for [start, end), when one exists. */
  fix?: string;
}

export interface Rule {
  name: string;
  check(text: string): Diagnostic[];
}
