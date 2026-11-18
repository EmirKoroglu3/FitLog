// Forgiving food search: Turkish-insensitive, word based, tolerant of suffixes
// ("nohutlu" → "Etli Nohut", "corba" → "Mercimek Çorbası").

const TR_MAP: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };

/** Lower-case, strip Turkish diacritics and punctuation. */
export function normalizeText(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining marks (e.g. the dot left by "İ")
    .replace(/[çğıöşüâîû]/g, (c) => TR_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const words = (s: string) => normalizeText(s).split(' ').filter(Boolean);

/** Does one query token match one word? Handles Turkish suffixes both ways. */
/** Turkish consonant softening before a vowel suffix: börek→böreği, kebap→kebabı, kanat→kanadı. */
const SOFTEN: Record<string, string> = { k: 'g', p: 'b', t: 'd', c: 'c' };

function tokenMatches(token: string, word: string): number {
  if (word === token) return 3;
  if (word.startsWith(token)) return 2; // "corba" → "corbasi", "tav" → "tavuk"
  const last = token[token.length - 1];
  if (token.length >= 4 && SOFTEN[last] && word.startsWith(token.slice(0, -1) + SOFTEN[last])) return 2; // "borek" → "boregi"
  // "nohutlu" → "nohut", "tavuklu" → "tavuk": query is the word plus a suffix
  if (word.length >= 4 && token.startsWith(word) && token.length - word.length <= 4) return 2;
  if (token.length >= 4 && word.includes(token)) return 1; // "fistik" in "fistikli"
  return 0;
}

/**
 * Score how well a query matches a food (0 = no match). Every query word must
 * match a word of the name, category or keywords; matches in the name score higher.
 */
export function foodMatchScore(query: string, name: string, extra: string[] = []): number {
  const q = words(query);
  if (q.length === 0) return 0;
  const nameWords = words(name);
  const extraWords = extra.flatMap(words);
  const normName = normalizeText(name);
  const normQuery = normalizeText(query);

  let score = 0;
  for (const token of q) {
    const inName = Math.max(0, ...nameWords.map((w) => tokenMatches(token, w)));
    const inExtra = Math.max(0, ...extraWords.map((w) => tokenMatches(token, w)));
    if (inName === 0 && inExtra === 0) return 0;
    score += inName * 2 + inExtra;
  }
  if (normName.startsWith(normQuery)) score += 5;
  else if (normName.includes(normQuery)) score += 3;
  return score;
}
