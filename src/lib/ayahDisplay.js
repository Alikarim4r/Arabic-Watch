import { escapeHtml, formatAyahRef } from './utils.js';
import { QURAN_TEXT_MISSING_AR } from './quranText.js';

/**
 * @param {number} surahId
 * @param {number} ayahFrom
 * @param {number} [ayahTo]
 */
export function mushafOpenButtonHtml(surahId, ayahFrom, ayahTo = ayahFrom) {
  return `<button type="button" class="btn mushaf-open-btn" data-mushaf-open data-surah-id="${surahId}" data-ayah-from="${ayahFrom}" data-ayah-to="${ayahTo}">فتح في المصحف</button>`;
}

/**
 * @param {HTMLElement} root
 */
export function bindMushafOpenButtons(root) {
  root.querySelectorAll('[data-mushaf-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const surahId = Number(btn.getAttribute('data-surah-id'));
      const ayahFrom = Number(btn.getAttribute('data-ayah-from'));
      const ayahTo = Number(btn.getAttribute('data-ayah-to') || ayahFrom);
      document.dispatchEvent(
        new CustomEvent('qsu:open-mushaf', {
          detail: { surahId, ayahFrom, ayahTo },
        })
      );
      location.hash = '#mushaf';
      document.getElementById('mushaf')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

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

  const mushafBtn = mushafOpenButtonHtml(surahId, ayahFrom, ayahTo);

  if (!allAvailable) {
    return `
      <div class="ayah quran-fallback">
        <small class="muted">${escapeHtml(ref)}</small>
        <p class="quran-missing-note">${escapeHtml(QURAN_TEXT_MISSING_AR)}</p>
        ${mushafBtn}
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
      ${mushafBtn}
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

  const mushafBtn = mushafOpenButtonHtml(ref.surah_id, ref.ayah_from, ref.ayah_to);

  if (!allAvailable) {
    return `
      <div class="ayah-inline quran-fallback">
        <span class="tag blue">${escapeHtml(label)}</span>
        <p class="quran-missing-note">${escapeHtml(QURAN_TEXT_MISSING_AR)}</p>
        ${mushafBtn}
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
      ${mushafBtn}
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
