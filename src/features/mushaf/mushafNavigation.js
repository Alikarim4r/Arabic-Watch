/** Default ayahs shown per "page" when reading mode is صفحة. */
export const MUSHAF_PAGE_AYAH_CHUNK = 10;

/**
 * @param {string} surahNameAr
 * @param {number} ayahFrom
 * @param {number} [ayahTo]
 */
export function formatAyahReferenceAr(surahNameAr, ayahFrom, ayahTo = ayahFrom) {
  if (ayahFrom === ayahTo) return `سورة ${surahNameAr} — الآية ${ayahFrom}`;
  return `سورة ${surahNameAr} — الآية ${ayahFrom}–${ayahTo}`;
}

/**
 * @param {number} surahId
 * @param {number} ayahFrom
 * @param {number} [ayahTo]
 */
export function openMushafAt(surahId, ayahFrom, ayahTo = ayahFrom) {
  const from = Math.min(ayahFrom, ayahTo);
  const to = Math.max(ayahFrom, ayahTo);
  document.dispatchEvent(
    new CustomEvent('qsu:open-mushaf', {
      detail: { surahId: Number(surahId), ayahFrom: from, ayahTo: to },
    })
  );
  if (location.hash !== '#mushaf') location.hash = '#mushaf';
  document.getElementById('mushaf')?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * @param {number} surahId
 * @param {number} ayahCount
 * @param {number} ayahFrom
 * @param {'page'|'list'} readingMode
 * @param {number} [chunkSize]
 */
export function getVisibleAyahRange(surahId, ayahCount, ayahFrom, readingMode, chunkSize = MUSHAF_PAGE_AYAH_CHUNK) {
  const from = clampAyah(ayahFrom, ayahCount);
  if (readingMode === 'list') {
    return { surahId, ayahFrom: 1, ayahTo: ayahCount, focusAyah: from };
  }
  const chunkStart = Math.floor((from - 1) / chunkSize) * chunkSize + 1;
  const chunkEnd = Math.min(ayahCount, chunkStart + chunkSize - 1);
  return { surahId, ayahFrom: chunkStart, ayahTo: chunkEnd, focusAyah: from };
}

/**
 * @param {number} currentAyah
 * @param {number} ayahCount
 * @param {'page'|'list'} readingMode
 * @param {number} [chunkSize]
 */
export function getNextAyahStep(currentAyah, ayahCount, readingMode, chunkSize = MUSHAF_PAGE_AYAH_CHUNK) {
  if (readingMode === 'list') return null;
  const chunkStart = Math.floor((currentAyah - 1) / chunkSize) * chunkSize + 1;
  const nextStart = chunkStart + chunkSize;
  if (nextStart > ayahCount) return null;
  return nextStart;
}

/**
 * @param {number} currentAyah
 * @param {'page'|'list'} readingMode
 * @param {number} [chunkSize]
 */
export function getPrevAyahStep(currentAyah, readingMode, chunkSize = MUSHAF_PAGE_AYAH_CHUNK) {
  if (readingMode === 'list') return null;
  const chunkStart = Math.floor((currentAyah - 1) / chunkSize) * chunkSize + 1;
  const prevStart = chunkStart - chunkSize;
  if (prevStart < 1) return null;
  return prevStart;
}

/**
 * @param {number} currentSurahId
 * @returns {number|null}
 */
export function getNextSurahId(currentSurahId) {
  if (currentSurahId >= 114) return null;
  return currentSurahId + 1;
}

/**
 * @param {number} currentSurahId
 * @returns {number|null}
 */
export function getPrevSurahId(currentSurahId) {
  if (currentSurahId <= 1) return null;
  return currentSurahId - 1;
}

/**
 * @param {number} ayahNumber
 * @param {number} ayahCount
 */
export function computeSurahProgress(ayahNumber, ayahCount) {
  if (!ayahCount) return 0;
  return Math.round((clampAyah(ayahNumber, ayahCount) / ayahCount) * 100);
}

/**
 * Surahs that traditionally omit Bismillah at the start (after surah 1).
 * @param {number} surahId
 */
export function shouldShowBismillah(surahId) {
  return surahId !== 1 && surahId !== 9;
}

/**
 * @param {number} ayah
 * @param {number} max
 */
export function clampAyah(ayah, max) {
  const n = Math.max(1, Math.floor(Number(ayah) || 1));
  return max ? Math.min(n, max) : n;
}

/**
 * @param {number} surahId
 * @param {number} ayahFrom
 * @param {number} ayahTo
 */
export function formatCopyReference(surahNameAr, surahId, ayahFrom, ayahTo) {
  const ref = ayahFrom === ayahTo ? `${surahId}:${ayahFrom}` : `${surahId}:${ayahFrom}-${ayahTo}`;
  return `${formatAyahReferenceAr(surahNameAr, ayahFrom, ayahTo)} (${ref})`;
}
