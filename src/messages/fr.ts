import type { Catalog } from './index.js';

// French spacing before ; ? after § and inside « » is U+00A0, escaped per the
// no-invisible-literals rule. Not U+202F: that is the character this
// linter exists to flag. Block names are the Unicode French charts' own.
export const fr: Catalog = {
  'mvs-context/misplaced':
    'MVS (U+180E) doit se trouver entre deux lettres mongoles (entre radical et suffixe, ou devant un a/e final séparé)',
  'fvs-placement/start':
    'FVS{n} ({char}) est en début de texte — un sélecteur de variante doit suivre immédiatement la lettre mongole qu’il modifie',
  'fvs-placement/after-fvs':
    'FVS{n} ({char}) suit FVS{prevN} ({prev}) — un sélecteur de variante doit suivre immédiatement la lettre mongole qu’il modifie',
  'fvs-placement/after-char':
    'FVS{n} ({char}) suit {prev} — un sélecteur de variante doit suivre immédiatement la lettre mongole qu’il modifie',
  'no-pua/one':
    '{count} point de code de la zone à usage privé — codage de glyphes hérité (époque Menksoft), et non du mongol Unicode interopérable',
  'no-pua/many':
    '{count} points de code de la zone à usage privé — codage de glyphes hérité (époque Menksoft), et non du mongol Unicode interopérable',
  'detached-suffix/verbal':
    '«\u00a0{suffix}\u00a0» ({cyrillic}) est une désinence verbale, toujours attachée au radical — supprimez le connecteur',
  'detached-suffix/formal':
    '«\u00a0{suffix}\u00a0» ({cyrillic}) s’écrit attaché au radical dans les documents officiels — supprimez le connecteur',
  'wrong-block/todo': 'Lettre todo ({char}) dans un texte hudum',
  'wrong-block/sibe': 'Lettre sibe ({char}) dans un texte hudum',
  'wrong-block/manchu': 'Lettre mandchoue ({char}) dans un texte hudum',
  'wrong-block/ali-gali': 'Lettre ali gali ({char}) dans un texte hudum',
  'wrong-block/ali-gali-lookalike':
    'Lettre ali gali ({char}) dans un texte hudum — vouliez-vous dire {target}\u00a0?',
  'zwj-zwnj/zwj':
    'ZWJ (U+200D) entre deux lettres mongoles — une forme positionnelle se force avec FVS1–4, pas avec ZWJ\u00a0; pour un trait de liaison visible, utilisez le nirugu (U+180A). En limite de mot, où il sélectionne une forme isolée, un ZWJ est légitime et n’est pas signalé',
  'zwj-zwnj/zwnj':
    'ZWNJ (U+200C) à côté d’une lettre mongole — au milieu d’un mot, il rompt la liaison, alors que c’est FVS1–4 qui sert à forcer une forme\u00a0; en bord de mot, il ne sélectionne rien que la mise en forme par défaut ne fasse déjà',
  'nnbsp-legacy/connector':
    'Le connecteur de suffixe NNBSP (U+202F) est obsolète depuis Unicode 16.0 — utilisez MVS (U+180E)',
  'nnbsp-legacy/particle':
    'NNBSP (U+202F) devant une particule séparée par une espace — ce sont des mots distincts, qui prennent une espace ordinaire, pas un connecteur',
  'compat-punctuation/vertical':
    'Forme verticale (conversion aller-retour avec GB 18030) {char} — caractère de compatibilité, à éviter dans les échanges\u00a0; écrivez {target} et laissez la police fournir le glyphe vertical',
  'compat-punctuation/cjk':
    'Forme de compatibilité CJC (conversion aller-retour avec CNS 11643) {char} — caractère de compatibilité, à éviter dans les échanges\u00a0; écrivez {target} et laissez la police fournir le glyphe vertical',
  'compat-punctuation/small':
    'Petite variante de forme (conversion aller-retour avec CNS 11643) {char} — caractère de compatibilité, à éviter dans les échanges\u00a0; écrivez {target} et laissez la police fournir le glyphe vertical',
  'compat-punctuation/borrowed':
    '{char} est une ponctuation empruntée au chinois — la spécification de base d’Unicode (§\u00a013.5) la réserve au todo et au sibe\u00a0; le hudum écrit {target}',
  'unknown-suffix/particle':
    '«\u00a0{word}\u00a0» ({cyrillic}) est un mot distinct, pas un suffixe — il prend une espace ordinaire, jamais un connecteur',
  'unknown-suffix/stray-fvs':
    'Suffixe «\u00a0{suffix}\u00a0» ({translit}) écrit avec un FVS superflu — après le connecteur, la mise en forme du suffixe est automatique',
  'unknown-suffix/unknown':
    'Suffixe hudum inconnu «\u00a0{suffix}\u00a0» après {connector} — absent du dictionnaire des suffixes',
  'doubled-ae/doubled':
    '{letter} ({char}) redoublé — les a/e longs s’écrivent avec le hiatus γ/g, jamais redoublés\u00a0; c’est en général le cyrillique аа/ээ recopié lettre à lettre (le réfléchi est ᠢᠶᠠᠨ/ᠢᠶᠡᠨ\u00a0; le vocatif est un seul ᠠ/ᠡ formant un mot à part)',
  'non-initial-o/later':
    'O/Ö (U+1823/U+1825) n’apparaît normalement qu’en première syllabe — les syllabes suivantes prennent U/Ü (U+1824/U+1826)\u00a0; les emprunts et quelques exceptions lexicales sont admis',
  'fusable-stack/fusable':
    '«\u00a0{first}\u00a0» + «\u00a0{second}\u00a0» peut aussi s’écrire sous la forme fusionnée «\u00a0{fused}\u00a0» ({translit}) — les deux graphies sont correctes',
};
