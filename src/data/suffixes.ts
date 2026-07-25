/**
 * The Hudum suffix dictionary, from `@gege-mn/mongol-bichig`.
 *
 * The linter does not own this data. Its normative source is
 * `skills/mongol-bichig/references/suffixes.md` in that repository, which a
 * test there parses to verify every row — and the converter reads the same
 * table, so a correction lands in both tools at once.
 *
 * `suffixes` here is the **connector-joined** subset: the 63 entries a
 * post-MVS letter run may legitimately be. The package also ships
 * `spaceParticles` — ᠤᠤ/ᠦᠦ/ᠪᠦᠦ/ᠦᠭᠡᠢ, which follow a plain space and must
 * never be connector-joined. Those are deliberately *not* re-exported as
 * suffixes: matching them after a connector would accept the exact bug that
 * the planned `space-before-suffix` rule exists to catch.
 */

export type { SuffixCategory, SuffixEntry } from '@gege-mn/mongol-bichig';
export { connectorSuffixes as suffixes, spaceParticles } from '@gege-mn/mongol-bichig';
