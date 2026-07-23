/** How urgently a finding needs attention. */
export type Severity = 'error' | 'warning' | 'info';

/** One finding, positioned in Unicode code points (not UTF-16 units). */
export interface Diagnostic {
  /** Rule that produced this finding, e.g. `nnbsp-legacy`. */
  rule: string;
  severity: Severity;
  message: string;
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
