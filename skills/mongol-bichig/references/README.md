# docs/ — the knowledge base

Curated, source-cited reference docs behind gege-linter's rules. Researched
from primary sources (Unicode core spec + UCD, the L2 register, UTN #57,
mongfontbuilder data, W3C, Poppe's grammar) on 2026-07-23/25. House rule
applies everywhere: invisible characters appear only as `U+XXXX` escapes,
never as literals.

| Doc | What it covers | Feeds |
|---|---|---|
| [encoding-model.md](encoding-model.md) | The current (Unicode 16+/17) model: block inventory, MVS's two roles, format-control properties, normalization, ZWJ/ZWNJ/nirugu, UTN #57 summary, version history | every rule; `mvs-context`, `nnbsp-legacy`, `zwj-zwnj` |
| [encoding-history.md](encoding-history.md) | 1987→2026: why the 1999 model failed, the suffix-connector saga, how MVS won via GB/T 25914—2023 | README narrative; provenance |
| [variation-sequences.md](variation-sequences.md) | FVS semantics, UCD-vs-UTN registry divergence, the Hudum valid-FVS table, vendoring traps | `fvs-placement`, planned `fvs-unregistered` |
| [script-styles.md](script-styles.md) | Hudum/Todo/Sibe/Manchu/Ali Gali: ranges vs letter profiles, look-alikes, locale metadata, severity calibration | `wrong-block` |
| [suffixes.md](suffixes.md) | The curated Hudum suffix dictionary (залгах нөхцөл) with code points, conditions, provenance | `unknown-suffix`, planned `space-before-suffix` |
| [legacy-encodings.md](legacy-encodings.md) | Menksoft/Saiyin/Boljoo PUA, CMs ASCII fonts, the IME landscape, PUA detection heuristics, converters | `no-pua`; corpus triage |
| [fonts-and-rendering.md](fonts-and-rendering.md) | Noto v3 vs Baiti, shaping engines, platform matrix, hb-shape recipes, how misuse renders | test verification; issue messages |
| [orthography.md](orthography.md) | Vowel harmony, chachlag, closed vowel-sequence inventory, ranked Tier-3 rule candidates with FP risk | `non-initial-o` upgrade; Tier 3 |

Reading order for newcomers: encoding-model → suffixes → variation-sequences,
then the rest as needed. encoding-history is the "why does any of this
exist" backstory.
