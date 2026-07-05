import { getRepository } from '../../lib/dataService.js';
import { escapeHtml } from '../../lib/utils.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';
import {
  loadMushafSettings,
  saveMushafSettings,
  applyMushafSettingsToDom,
} from './mushafSettings.js';
import {
  getLastReadPosition,
  saveLastReadPosition,
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
} from './mushafBookmarks.js';
import {
  formatAyahReferenceAr,
  formatCopyReference,
  getVisibleAyahRange,
  getNextAyahStep,
  getPrevAyahStep,
  getNextSurahId,
  getPrevSurahId,
  computeSurahProgress,
  clampAyah,
  openMushafAt,
} from './mushafNavigation.js';
import {
  renderSurahHeaderHtml,
  renderBismillahHtml,
  renderAyahBlockHtml,
  scrollToAyah,
} from './mushafPageView.js';

/** @type {null | ((surahId: number, ayahFrom: number, ayahTo?: number) => Promise<void>)} */
let navigateMushaf = null;

document.addEventListener('qsu:open-mushaf', (e) => {
  const { surahId, ayahFrom, ayahTo } = e.detail || {};
  if (surahId && ayahFrom) {
    navigateMushaf?.(Number(surahId), Number(ayahFrom), Number(ayahTo ?? ayahFrom));
  }
});

/**
 * @param {HTMLElement} container
 */
export async function renderMushafReader(container) {
  container.innerHTML = `
    <section id="mushaf" class="mushaf-section">
      <div class="wrap">
        <div class="head">
          <span class="eyebrow">المصحف</span>
          <h2>قارئ المصحف</h2>
          <p>واجهة قراءة متصلة بخط استيراد النص القرآني — مراجع آمنة قبل الاستيراد، ونص عثماني كما هو مستورد بعده.</p>
        </div>
        <div class="glass pad mushaf-shell" id="mushaf-shell">
          <div class="state-box">جاري تحميل المصحف…</div>
        </div>
      </div>
    </section>
  `;

  const shell = container.querySelector('#mushaf-shell');
  const repo = await getRepository();
  const surahs = (await repo.getSurahs?.()) || [];
  const surahMap = new Map(surahs.map((s) => [s.id, s]));

  let settings = loadMushafSettings();
  let surahId = getLastReadPosition()?.surahId || 1;
  let ayahFrom = getLastReadPosition()?.ayahFrom || 1;
  let ayahTo = getLastReadPosition()?.ayahTo || ayahFrom;
  let quranImported = false;

  navigateMushaf = async (nextSurahId, nextAyahFrom, nextAyahTo) => {
    surahId = nextSurahId;
    ayahFrom = nextAyahFrom;
    ayahTo = nextAyahTo ?? nextAyahFrom;
    await render();
    document.getElementById('mushaf')?.scrollIntoView({ behavior: 'smooth' });
  };

  async function render() {
    quranImported = repo.isQuranTextImported ? await repo.isQuranTextImported() : false;
    const surah = surahMap.get(surahId) || surahs[0];
    if (!surah) {
      shell.innerHTML = '<div class="state-box">لا توجد بيانات السور.</div>';
      return;
    }

    surahId = surah.id;
    const ayahCount = surah.ayah_count;
    ayahFrom = clampAyah(ayahFrom, ayahCount);
    ayahTo = clampAyah(ayahTo, ayahCount);

    const visible = getVisibleAyahRange(surahId, ayahCount, ayahFrom, settings.readingMode);
    const ayahs = await repo.getAyahRange(visible.surahId, visible.ayahFrom, visible.ayahTo);
    const progress = computeSurahProgress(visible.focusAyah, ayahCount);
    const lastRead = getLastReadPosition();
    const bookmarks = getBookmarks();
    const bookmarked = isBookmarked({ surahId, ayahFrom: visible.focusAyah, ayahTo: visible.focusAyah });
    const prevSurah = getPrevSurahId(surahId);
    const nextSurah = getNextSurahId(surahId);
    const prevChunk = getPrevAyahStep(visible.focusAyah, settings.readingMode);
    const nextChunk = getNextAyahStep(visible.focusAyah, ayahCount, settings.readingMode);
    const currentRef = formatAyahReferenceAr(surah.name_ar, visible.focusAyah);

    saveLastReadPosition({
      surahId,
      ayahFrom: visible.focusAyah,
      ayahTo: visible.focusAyah,
      label: currentRef,
    });

    shell.innerHTML = `
      <div class="mushaf-toolbar">
        <div class="mushaf-toolbar-row">
          <label class="mushaf-field">
            <span>السورة</span>
            <select id="mushaf-surah-select" class="mushaf-select">
              ${surahs
                .map(
                  (s) =>
                    `<option value="${s.id}" ${s.id === surahId ? 'selected' : ''}>${s.id}. ${escapeHtml(s.name_ar)}</option>`
                )
                .join('')}
            </select>
          </label>
          <label class="mushaf-field mushaf-field-sm">
            <span>من آية</span>
            <input id="mushaf-ayah-from" type="number" min="1" max="${ayahCount}" value="${visible.ayahFrom}" />
          </label>
          <label class="mushaf-field mushaf-field-sm">
            <span>إلى</span>
            <input id="mushaf-ayah-to" type="number" min="1" max="${ayahCount}" value="${visible.ayahTo}" />
          </label>
          <button type="button" class="btn primary" id="mushaf-goto">انتقال</button>
        </div>
        <div class="mushaf-toolbar-row mushaf-toolbar-actions">
          <button type="button" class="btn" id="mushaf-prev-surah" ${prevSurah ? '' : 'disabled'}>السورة السابقة</button>
          <button type="button" class="btn" id="mushaf-prev-chunk" ${prevChunk ? '' : 'disabled'}>الصفحة السابقة</button>
          <button type="button" class="btn" id="mushaf-next-chunk" ${nextChunk ? '' : 'disabled'}>الصفحة التالية</button>
          <button type="button" class="btn" id="mushaf-next-surah" ${nextSurah ? '' : 'disabled'}>السورة التالية</button>
        </div>
        <div class="mushaf-toolbar-row">
          <input id="mushaf-search" type="search" class="mushaf-search" placeholder="بحث في المصحف — قريبًا" disabled aria-disabled="true" />
          <label class="mushaf-field mushaf-field-sm">
            <span>انتقال سريع</span>
            <input id="mushaf-goto-surah" type="number" min="1" max="114" placeholder="سورة" />
          </label>
          <label class="mushaf-field mushaf-field-sm">
            <span>آية</span>
            <input id="mushaf-goto-ayah" type="number" min="1" placeholder="آية" />
          </label>
          <button type="button" class="btn" id="mushaf-goto-quick">اذهب</button>
        </div>
      </div>

      <div class="mushaf-status-bar">
        <span class="tag ${quranImported ? 'green' : 'rose'}" id="mushaf-import-status">
          ${quranImported ? 'النص القرآني مستورد' : 'النص غير مستورد — مراجع فقط'}
        </span>
        <span class="mushaf-progress" id="mushaf-progress">التقدم في السورة: ${progress}%</span>
        ${
          lastRead
            ? `<button type="button" class="btn mushaf-last-read-btn" id="mushaf-resume">آخر قراءة: ${escapeHtml(lastRead.label || formatAyahReferenceAr(surahMap.get(lastRead.surahId)?.name_ar || '', lastRead.ayahFrom))}</button>`
            : ''
        }
      </div>

      <div class="mushaf-settings-panel" id="mushaf-settings-panel">
        <div class="mushaf-settings-row">
          <label>حجم الخط
            <input type="range" id="mushaf-font-size" min="16" max="40" value="${settings.fontSize}" />
            <span id="mushaf-font-size-val">${settings.fontSize}px</span>
          </label>
          <label>تباعد الأسطر
            <input type="range" id="mushaf-line-height" min="1.4" max="2.6" step="0.1" value="${settings.lineHeight}" />
            <span id="mushaf-line-height-val">${settings.lineHeight}</span>
          </label>
          <label>وضع القراءة
            <select id="mushaf-reading-mode">
              <option value="page" ${settings.readingMode === 'page' ? 'selected' : ''}>صفحة</option>
              <option value="list" ${settings.readingMode === 'list' ? 'selected' : ''}>قائمة آيات</option>
            </select>
          </label>
          <label class="mushaf-check"><input type="checkbox" id="mushaf-show-numbers" ${settings.showAyahNumbers ? 'checked' : ''} /> أرقام الآيات</label>
          <label class="mushaf-check"><input type="checkbox" id="mushaf-show-refs" ${settings.showReferences ? 'checked' : ''} /> المراجع</label>
          <label class="mushaf-check"><input type="checkbox" id="mushaf-night" ${settings.nightMode ? 'checked' : ''} /> وضع ليلي</label>
          <button type="button" class="btn" id="mushaf-fullscreen">ملء الشاشة</button>
        </div>
      </div>

      <div class="mushaf-reading-wrap">
        <div class="mushaf-reading-area" id="mushaf-reading-area">
          ${renderSurahHeaderHtml(surah)}
          ${renderBismillahHtml(surahId)}
          ${renderAyahBlockHtml(ayahs, surah.name_ar, settings, quranImported)}
        </div>
        <aside class="mushaf-side-panel">
          <div class="mushaf-side-actions">
            <button type="button" class="btn primary" id="mushaf-bookmark">${bookmarked ? 'إزالة الإشارة' : 'إشارة مرجعية'}</button>
            <button type="button" class="btn" id="mushaf-copy-ref">نسخ المرجع</button>
          </div>
          <h4 class="gold">الإشارات المرجعية</h4>
          <ul class="mushaf-bookmark-list" id="mushaf-bookmark-list">
            ${
              bookmarks.length
                ? bookmarks
                    .map((b) => {
                      const name = surahMap.get(b.surahId)?.name_ar || `سورة ${b.surahId}`;
                      const label = b.label || formatAyahReferenceAr(name, b.ayahFrom, b.ayahTo);
                      return `<li><button type="button" class="mushaf-bookmark-item" data-surah="${b.surahId}" data-from="${b.ayahFrom}" data-to="${b.ayahTo ?? b.ayahFrom}">${escapeHtml(label)}</button></li>`;
                    })
                    .join('')
                : '<li class="muted">لا توجد إشارات بعد.</li>'
            }
          </ul>
        </aside>
      </div>

      <p class="mushaf-disclaimer disclaimer-banner">${DISCLAIMER_AR}</p>
    `;

    applyMushafSettingsToDom(shell, settings);
    bindEvents(surah, visible.focusAyah);
    scrollToAyah(shell.querySelector('#mushaf-reading-area'), visible.focusAyah);
  }

  function bindEvents(surah, focusAyah) {
    shell.querySelector('#mushaf-surah-select')?.addEventListener('change', (e) => {
      surahId = Number(e.target.value);
      ayahFrom = 1;
      ayahTo = 1;
      render();
    });

    shell.querySelector('#mushaf-goto')?.addEventListener('click', () => {
      ayahFrom = Number(shell.querySelector('#mushaf-ayah-from')?.value || 1);
      ayahTo = Number(shell.querySelector('#mushaf-ayah-to')?.value || ayahFrom);
      render();
    });

    shell.querySelector('#mushaf-goto-quick')?.addEventListener('click', () => {
      const sid = Number(shell.querySelector('#mushaf-goto-surah')?.value);
      const an = Number(shell.querySelector('#mushaf-goto-ayah')?.value || 1);
      if (sid >= 1 && sid <= 114) {
        surahId = sid;
        ayahFrom = an;
        ayahTo = an;
        render();
      }
    });

    shell.querySelector('#mushaf-prev-surah')?.addEventListener('click', () => {
      const prev = getPrevSurahId(surahId);
      if (prev) {
        surahId = prev;
        ayahFrom = 1;
        ayahTo = 1;
        render();
      }
    });

    shell.querySelector('#mushaf-next-surah')?.addEventListener('click', () => {
      const next = getNextSurahId(surahId);
      if (next) {
        surahId = next;
        ayahFrom = 1;
        ayahTo = 1;
        render();
      }
    });

    shell.querySelector('#mushaf-prev-chunk')?.addEventListener('click', () => {
      const prev = getPrevAyahStep(focusAyah, settings.readingMode);
      if (prev) {
        ayahFrom = prev;
        ayahTo = prev;
        render();
      }
    });

    shell.querySelector('#mushaf-next-chunk')?.addEventListener('click', () => {
      const next = getNextAyahStep(focusAyah, surah.ayah_count, settings.readingMode);
      if (next) {
        ayahFrom = next;
        ayahTo = next;
        render();
      }
    });

    shell.querySelector('#mushaf-font-size')?.addEventListener('input', (e) => {
      settings = saveMushafSettings({ fontSize: Number(e.target.value) });
      shell.querySelector('#mushaf-font-size-val').textContent = `${settings.fontSize}px`;
      applyMushafSettingsToDom(shell, settings);
    });

    shell.querySelector('#mushaf-line-height')?.addEventListener('input', (e) => {
      settings = saveMushafSettings({ lineHeight: Number(e.target.value) });
      shell.querySelector('#mushaf-line-height-val').textContent = String(settings.lineHeight);
      applyMushafSettingsToDom(shell, settings);
    });

    shell.querySelector('#mushaf-reading-mode')?.addEventListener('change', (e) => {
      settings = saveMushafSettings({ readingMode: e.target.value });
      render();
    });

    shell.querySelector('#mushaf-show-numbers')?.addEventListener('change', (e) => {
      settings = saveMushafSettings({ showAyahNumbers: e.target.checked });
      applyMushafSettingsToDom(shell, settings);
      shell.querySelectorAll('.mushaf-ayah-badge').forEach((el) => {
        el.style.display = settings.showAyahNumbers ? '' : 'none';
      });
    });

    shell.querySelector('#mushaf-show-refs')?.addEventListener('change', (e) => {
      settings = saveMushafSettings({ showReferences: e.target.checked });
      applyMushafSettingsToDom(shell, settings);
    });

    shell.querySelector('#mushaf-night')?.addEventListener('change', (e) => {
      settings = saveMushafSettings({ nightMode: e.target.checked });
      applyMushafSettingsToDom(shell, settings);
    });

    shell.querySelector('#mushaf-fullscreen')?.addEventListener('click', async () => {
      const area = shell.querySelector('#mushaf-reading-area');
      if (!area) return;
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await area.requestFullscreen();
      } catch {
        /* fullscreen may be blocked */
      }
    });

    shell.querySelector('#mushaf-bookmark')?.addEventListener('click', () => {
      const pos = { surahId, ayahFrom: focusAyah, ayahTo: focusAyah, label: formatAyahReferenceAr(surah.name_ar, focusAyah) };
      if (isBookmarked(pos)) removeBookmark(pos);
      else addBookmark(pos);
      render();
    });

    shell.querySelector('#mushaf-copy-ref')?.addEventListener('click', async () => {
      const text = formatCopyReference(surah.name_ar, surahId, focusAyah, focusAyah);
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* clipboard may be unavailable */
      }
    });

    shell.querySelector('#mushaf-resume')?.addEventListener('click', () => {
      const lr = getLastReadPosition();
      if (lr) openMushafAt(lr.surahId, lr.ayahFrom, lr.ayahTo);
    });

    shell.querySelectorAll('.mushaf-bookmark-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        openMushafAt(Number(btn.dataset.surah), Number(btn.dataset.from), Number(btn.dataset.to));
      });
    });
  }

  await render();
}

export { openMushafAt };
