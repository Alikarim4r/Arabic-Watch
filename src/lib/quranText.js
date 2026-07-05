/** Arabic placeholder when licensed Quran text has not been imported. */
export const QURAN_TEXT_MISSING_AR =
  'النص القرآني الكامل غير مستورد بعد. يظهر هنا مرجع الآية فقط.';

/**
 * @param {Object|null|undefined} quranIndex
 * @returns {boolean}
 */
export function isFullQuranImported(quranIndex) {
  return Boolean(quranIndex?.is_full_quran && quranIndex?.ayah_count === 6236);
}

/**
 * @param {Object|null|undefined} quranIndex
 * @param {number} surahId
 * @param {number} ayahNumber
 * @returns {boolean}
 */
export function isAyahTextAvailable(quranIndex, surahId, ayahNumber) {
  const key = `${surahId}:${ayahNumber}`;
  const ayah = quranIndex?.by_key?.[key];
  return Boolean(ayah?.text_uthmani);
}

/**
 * @param {Object|null|undefined} quranIndex
 * @param {number} surahId
 * @param {number} ayahFrom
 * @param {number} ayahTo
 * @returns {'available'|'partial'|'missing'}
 */
export function getAyahRangeTextStatus(quranIndex, surahId, ayahFrom, ayahTo) {
  const from = Math.min(ayahFrom, ayahTo);
  const to = Math.max(ayahFrom, ayahTo);
  let available = 0;
  let total = 0;

  for (let n = from; n <= to; n++) {
    total++;
    if (isAyahTextAvailable(quranIndex, surahId, n)) available++;
  }

  if (available === 0) return 'missing';
  if (available === total) return 'available';
  return 'partial';
}

/**
 * Build ayah lookup helpers bound to a Quran index payload.
 * @param {Object|null|undefined} quranIndex
 */
export function createQuranTextAccessors(quranIndex) {
  return {
    isFullQuranImported: () => isFullQuranImported(quranIndex),
    getMeta: () => quranIndex?.meta || null,

    /**
     * @param {number} surahId
     * @param {number} ayahNumber
     */
    getAyah(surahId, ayahNumber) {
      const key = `${surahId}:${ayahNumber}`;
      const hit = quranIndex?.by_key?.[key];
      if (hit?.text_uthmani) {
        return { ...hit, available: true };
      }
      return {
        surah_id: surahId,
        ayah_number: ayahNumber,
        ayah_key: key,
        available: false,
        placeholder_ar: QURAN_TEXT_MISSING_AR,
      };
    },

    /**
     * @param {number} surahId
     * @param {number} ayahFrom
     * @param {number} ayahTo
     */
    getAyahRange(surahId, ayahFrom, ayahTo) {
      const from = Math.min(ayahFrom, ayahTo);
      const to = Math.max(ayahFrom, ayahTo);
      const rows = [];
      for (let n = from; n <= to; n++) {
        rows.push(this.getAyah(surahId, n));
      }
      return rows;
    },

    /**
     * @param {number} surahId
     */
    getSurahAyahs(surahId) {
      const keys = quranIndex?.surah_index?.[String(surahId)] || [];
      return keys.map((key) => {
        const hit = quranIndex?.by_key?.[key];
        if (hit?.text_uthmani) return { ...hit, available: true };
        const [, ayahNumber] = key.split(':').map(Number);
        return {
          surah_id: surahId,
          ayah_number: ayahNumber,
          ayah_key: key,
          available: false,
          placeholder_ar: QURAN_TEXT_MISSING_AR,
        };
      });
    },

    getAyahRangeTextStatus(surahId, ayahFrom, ayahTo) {
      return getAyahRangeTextStatus(quranIndex, surahId, ayahFrom, ayahTo);
    },
  };
}

/**
 * Attach Quran text methods to a repository instance.
 * @param {Object} repo
 * @param {Object|null|undefined} quranIndex
 */
export function attachQuranTextMethods(repo, quranIndex) {
  const access = createQuranTextAccessors(quranIndex);

  repo.isQuranTextImported = async () => access.isFullQuranImported();
  repo.getQuranTextMeta = async () => access.getMeta();
  repo.getAyah = async (surahId, ayahNumber) => access.getAyah(surahId, ayahNumber);
  repo.getAyahRange = async (surahId, ayahFrom, ayahTo) =>
    access.getAyahRange(surahId, ayahFrom, ayahTo);
  repo.getSurahAyahs = async (surahId) => access.getSurahAyahs(surahId);
  repo.getAyahRangeTextStatus = async (surahId, ayahFrom, ayahTo) =>
    access.getAyahRangeTextStatus(surahId, ayahFrom, ayahTo);

  return repo;
}
