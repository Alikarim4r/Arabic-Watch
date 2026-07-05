import { escapeHtml, formatAyahRef } from './utils.js';
import { QURAN_TEXT_MISSING_AR } from './quranText.js';

/**
 * @param {Object} repo
 * @param {number} surahId
 * @param {number} ayahFrom
 * @param {number} ayahTo
 * @returns {Promise<string>}
 */
export async function renderAyahRangeHtml(repo, surahId, ayahFrom, ayahTo) {
  const rows = await repo.getAyahRange(surahId, ayahFrom, ayahTo);
  const ref = formatAyahRef(surahId, ayahFrom, ayahTo);
  const allAvailable = rows.every((r) => r.available);

  if (!allAvailable) {
    return `
      <div class="ayah quran-fallback">
        <small class="muted">${escapeHtml(ref)}</small>
        <p class="quran-missing-note">${escapeHtml(QURAN_TEXT_MISSING_AR)}</p>
      </div>`;
  }

  return `
    <div class="ayah quran-text-block">
      <small class="muted">${escapeHtml(ref)}</small>
      ${rows
        .map(
          (r) => `
        <p class="quran-uthmani" dir="rtl" lang="ar">${escapeHtml(r.text_uthmani)}</p>`
        )
        .join('')}
    </div>`;
}

/**
 * Compact inline block for Story Mode cards.
 * @param {Object} repo
 * @param {{ surah_id: number, ayah_from: number, ayah_to: number }} ref
 */
export async function renderAyahInlineHtml(repo, ref) {
  const rows = await repo.getAyahRange(ref.surah_id, ref.ayah_from, ref.ayah_to);
  const label = formatAyahRef(ref.surah_id, ref.ayah_from, ref.ayah_to);
  const allAvailable = rows.every((r) => r.available);

  if (!allAvailable) {
    return `
      <div class="ayah-inline quran-fallback">
        <span class="tag blue">${escapeHtml(label)}</span>
        <p class="quran-missing-note">${escapeHtml(QURAN_TEXT_MISSING_AR)}</p>
      </div>`;
  }

  return `
    <div class="ayah-inline quran-text-block">
      <span class="tag blue">${escapeHtml(label)}</span>
      ${rows
        .map(
          (r) => `
        <p class="quran-uthmani" dir="rtl" lang="ar">${escapeHtml(r.text_uthmani)}</p>`
        )
        .join('')}
    </div>`;
}

/**
 * @param {'available'|'partial'|'missing'} status
 */
export function quranTextStatusBadgeHtml(status) {
  if (status === 'available') {
    return '<span class="tag green quran-text-badge">النص متوفر</span>';
  }
  return '<span class="tag rose quran-text-badge">النص غير مستورد</span>';
}
