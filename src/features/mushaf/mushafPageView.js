import { escapeHtml } from '../../lib/utils.js';
import { QURAN_TEXT_MISSING_AR } from '../../lib/quranText.js';
import { formatAyahReferenceAr, shouldShowBismillah } from './mushafNavigation.js';

/** Configurable Bismillah placeholder — not substituted for licensed ayah text. */
export const BISMILLAH_PLACEHOLDER_AR = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

/**
 * @param {{ name_ar: string, id: number, ayah_count: number, revelation_type?: string }} surah
 */
export function renderSurahHeaderHtml(surah) {
  const typeLabel = surah.revelation_type === 'makkah' ? 'مكية' : 'مدنية';
  return `
    <header class="mushaf-surah-header">
      <h3 class="mushaf-surah-title">${escapeHtml(surah.name_ar)}</h3>
      <p class="mushaf-surah-meta muted">
        <span class="tag blue">سورة ${surah.id}</span>
        <span class="tag">${surah.ayah_count} آية</span>
        <span class="tag">${typeLabel}</span>
      </p>
    </header>`;
}

/**
 * @param {number} surahId
 */
export function renderBismillahHtml(surahId) {
  if (!shouldShowBismillah(surahId)) return '';
  return `
    <div class="mushaf-bismillah" dir="rtl" lang="ar" aria-label="البسملة">
      <p class="mushaf-bismillah-text">${escapeHtml(BISMILLAH_PLACEHOLDER_AR)}</p>
    </div>`;
}

/**
 * @param {Object} ayah
 * @param {string} surahNameAr
 * @param {{ showAyahNumbers: boolean, showReferences: boolean }} settings
 */
export function renderSingleAyahHtml(ayah, surahNameAr, settings) {
  const num = ayah.ayah_number;
  const refAr = formatAyahReferenceAr(surahNameAr, num);
  const numberBadge = settings.showAyahNumbers
    ? `<span class="mushaf-ayah-badge" aria-hidden="true">${num}</span>`
    : '';
  const refLine = settings.showReferences
    ? `<small class="mushaf-ayah-ref muted">${escapeHtml(refAr)}</small>`
    : '';

  if (ayah.available && ayah.text_uthmani) {
    return `
      <article class="mushaf-ayah mushaf-ayah-available" data-ayah="${num}" id="mushaf-ayah-${ayah.surah_id}-${num}">
        ${numberBadge}
        ${refLine}
        <p class="mushaf-ayah-text quran-uthmani" dir="rtl" lang="ar">${escapeHtml(ayah.text_uthmani)}</p>
      </article>`;
  }

  return `
    <article class="mushaf-ayah mushaf-ayah-missing" data-ayah="${num}" id="mushaf-ayah-${ayah.surah_id}-${num}">
      ${numberBadge}
      ${refLine}
      <p class="mushaf-ayah-ref-only">${escapeHtml(refAr)}</p>
      <p class="quran-missing-note">${escapeHtml(ayah.placeholder_ar || QURAN_TEXT_MISSING_AR)}</p>
    </article>`;
}

/**
 * @param {Object[]} ayahs
 * @param {string} surahNameAr
 * @param {{ showAyahNumbers: boolean, showReferences: boolean, readingMode: 'page'|'list' }} settings
 * @param {boolean} quranImported
 */
export function renderAyahBlockHtml(ayahs, surahNameAr, settings, quranImported) {
  if (!ayahs.length) {
    return `<p class="muted">لا توجد آيات في هذا النطاق.</p>`;
  }

  const importNote = quranImported
    ? ''
    : `<p class="mushaf-import-note quran-missing-note">${escapeHtml(QURAN_TEXT_MISSING_AR)}</p>`;

  const items = ayahs.map((a) => renderSingleAyahHtml(a, surahNameAr, settings)).join('');
  const modeClass = settings.readingMode === 'list' ? 'mushaf-ayah-list' : 'mushaf-ayah-page';

  return `
    ${importNote}
    <div class="mushaf-ayah-block ${modeClass}">
      ${items}
    </div>`;
}

/**
 * @param {HTMLElement} container
 * @param {number} focusAyah
 */
export function scrollToAyah(container, focusAyah) {
  const target = container.querySelector(`[data-ayah="${focusAyah}"]`);
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
