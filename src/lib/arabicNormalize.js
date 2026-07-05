/**
 * Arabic text normalization for search.
 * - Removes tashkeel (diacritics)
 * - Normalizes hamza variants to alif
 * - Normalizes ta marbuta / ha carefully (ة → ه at word end optional mode)
 * - Normalizes alif maqsura / ya
 */

const TASHKEEL = /[\u064B-\u065F\u0670\u0640]/g;
const TATWEEL = /\u0640/g;

const HAMZA_VARIANTS = /[\u0622\u0623\u0625\u0671\u0624\u0626]/g;

/**
 * @param {string} text
 * @returns {string}
 */
export function removeTashkeel(text) {
  if (!text) return '';
  return String(text).replace(TASHKEEL, '').replace(TATWEEL, '');
}

/**
 * @param {string} text
 * @param {{ normalizeTaMarbuta?: boolean }} [options]
 * @returns {string}
 */
export function normalizeArabic(text, options = {}) {
  const { normalizeTaMarbuta = true } = options;
  if (!text) return '';

  let result = removeTashkeel(text);
  result = result.replace(HAMZA_VARIANTS, '\u0627');
  result = result.replace(/\u0649/g, '\u064A'); // alif maqsura → ya

  if (normalizeTaMarbuta) {
    result = result.replace(/\u0629/g, '\u0647');
  }

  return result.trim().replace(/\s+/g, ' ');
}

/**
 * @param {string} query
 * @param {string} target
 * @param {'exact'|'normalized'} mode
 */
export function matchesArabicQuery(query, target, mode = 'normalized') {
  if (!query || !target) return false;
  if (mode === 'exact') {
    return target.includes(query);
  }
  const nq = normalizeArabic(query).toLowerCase();
  const nt = normalizeArabic(target).toLowerCase();
  return nt.includes(nq);
}

/**
 * Tokenize for multi-word normalized search.
 * @param {string} query
 * @param {string} target
 */
export function matchesAllTokens(query, target) {
  const tokens = normalizeArabic(query).split(/\s+/).filter(Boolean);
  const normalizedTarget = normalizeArabic(target).toLowerCase();
  return tokens.every((token) => normalizedTarget.includes(token.toLowerCase()));
}
