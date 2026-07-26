# gege-linter

`@gege-mn/gege-linter` (bin: `gege-linter`) — lints traditional Mongolian
script (Mongol bichig) text for incorrect or legacy Unicode usage. Public API:
`lint`, `applyFixes`, `rules`, per-rule exports, types. The CLI is done;
`runCli` is exported for tests.

Born out of ~/Projects/gege.mn — its first consumer, via the /type pad's
issues panel and a CI scan of bichig string constants — but deliberately its
own project.

<!-- Maintainer note: block-level HTML comments are stripped before this file
     reaches Claude's context, so notes like this one cost zero tokens.
     Keep this file under ~100 lines. Detail belongs in docs/, linked below
     with plain backticked paths — NOT @imports, which load eagerly and would
     defeat the purpose. -->

## Never run `npm publish`

**Publishing belongs to the repository owner, never an agent.** The registry
requires an OTP an agent cannot supply, so an attempt fails at best and
half-releases at worst. An agent *may* bump the version, write the CHANGELOG,
run `pnpm build && pnpm typecheck && pnpm test`, confirm `npm pack --dry-run`
ships the right files, and then report that the release is ready — and stop
there. Same rule in gege-converter and mongol-bichig.

## Conventions

- **pnpm**, Biome (2-space indent, single quotes), Vitest, plain `tsc` to
  `dist/`. **No third-party runtime dependencies** — the single dependency is
  first-party `@gege-mn/mongol-bichig`, itself dependency-free. Keep it that
  way.
- **Never type invisible characters as literals in source** (NNBSP U+202F,
  MVS U+180E, FVS1–4, ZWJ/ZWNJ): always `\uXXXX` escapes. Visible bichig
  letters may appear literally. This is hard-won, not a style preference —
  invisible literals get silently mistranscribed.
- Diagnostics use **code-point offsets**, not UTF-16 units — matching the
  gege.mn /type pad's caret model. Consumers must never `String.slice` with
  them; that is what `applyFixes` is for.
- One rule per file under `src/rules/`, registered in `src/index.ts`. Each
  rule is `{ name, check(text): Diagnostic[] }`, a pure function, and offers a
  `fix` string whenever the correction is mechanical.
- **Looking right proves nothing.** NNBSP- and MVS-joined suffixes shape
  byte-identically in Noto v3.002; only the bytes differ. Every check reads
  code points, never rendering. Corollary for review: bichig cannot be judged
  from terminal output — render to HTML in the gitignored `.tmp/` instead.

## Facts that belong elsewhere

**The script's fact base lives in ~/Projects/mongol-bichig** — nine
source-cited reference documents plus `sources.md`. Do not re-derive script
facts here and do not copy them back into this repo. Read them on demand:
`npx skills add gege-mn/mongol-bichig`.

The one fact that explains why this project exists: **Unicode 16.0 (Sept 2024)
moved the suffix connector from NNBSP (U+202F) to MVS (U+180E)** — core spec
ch. 13.5, unchanged through 17.0. It changed **zero UCD properties** and is
absent from the release notes, so the whole model lives in core-spec prose and
font GSUB. That is why a text-level linter is the only enforcement layer that
can exist, and this is the first one.

The suffix dictionary is **not this repo's data** — it is `connectorSuffixes`
from `@gege-mn/mongol-bichig`. A suffix correction belongs over there; it then
reaches the converter too.

## Read on demand

Do not read these by default. Open one when its topic actually comes up.

| File | Read it when |
|---|---|
| `docs/rules.md` | adding/renaming/changing a rule, deciding a severity, or picking the next task |
| mongol-bichig `skills/mongol-bichig/references/` | any question about the script itself |
| mongol-bichig `sources.md` | you need the provenance of a claim |

## Siblings

- **~/Projects/mongol-bichig** — the shared source of truth: canonical data,
  the reference documents, and both agent skills. Script-fact and suffix
  corrections go there, not here.
- **~/Projects/gege-converter** — the inverse problem (Cyrillic → bichig). Its
  stage 8 takes `lint` from here as an injected hook, so it depends on this
  package and this one never depends on it.
- This linter's **user-facing skill lives in mongol-bichig**, at
  `skills/gege-linter/SKILL.md`. Nothing enforces that it stays in step with
  the code, so a rule rename means remembering to update it there.
