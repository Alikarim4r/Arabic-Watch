import { searchContent } from '../../lib/dataService.js';
import { reviewBadgeHtml } from '../../components/reviewBadge.js';
import { escapeHtml } from '../../lib/utils.js';
import { renderStateBox } from '../../components/loadingState.js';
import { openStudyModal } from '../study/studyModal.js';

/**
 * @param {HTMLElement} container
 * @param {Object} filters
 * @param {(filters: Object) => void} onFiltersChange
 */
export async function renderSearchView(container, filters, onFiltersChange) {
  container.innerHTML = `
    <section class="panel">
      <h2 class="panel-title">محرك البحث</h2>
      <div class="search-bar">
        <input id="search-query" type="search" placeholder="ابحث في الشخصيات، الأحداث، المحاور…" value="${escapeHtml(filters.query || '')}" />
        <select id="search-mode">
          <option value="normalized">بحث عربي مطبّع</option>
          <option value="exact">بحث مطابق</option>
        </select>
        <select id="search-type">
          <option value="">كل الأنواع</option>
          <option value="prophet">أنبياء</option>
          <option value="person">شخصيات</option>
          <option value="event">أحداث</option>
          <option value="theme">محاور</option>
          <option value="place">أماكن</option>
          <option value="surah">سور</option>
        </select>
        <select id="search-review">
          <option value="">كل حالات المراجعة</option>
          <option value="approved">مراجَع</option>
          <option value="pending">قيد المراجعة</option>
          <option value="needs_source">يحتاج مصدر</option>
        </select>
        <select id="search-surah">
          <option value="">كل السور</option>
        </select>
      </div>
      <div id="search-results" class="search-results"></div>
    </section>
  `;

  const { getRepository } = await import('../../lib/dataService.js');
  const surahs = await (await getRepository()).getSurahs();
  const surahSelect = container.querySelector('#search-surah');
  surahs.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = String(s.id);
    opt.textContent = `${s.id}. ${s.name_ar}`;
    if (String(filters.surahId) === String(s.id)) opt.selected = true;
    surahSelect.appendChild(opt);
  });

  const resultsEl = container.querySelector('#search-results');
  renderStateBox(resultsEl, 'loading');

  const runSearch = async () => {
    const nextFilters = {
      query: container.querySelector('#search-query').value,
      mode: container.querySelector('#search-mode').value,
      type: container.querySelector('#search-type').value,
      reviewStatus: container.querySelector('#search-review').value,
      surahId: container.querySelector('#search-surah').value,
    };
    onFiltersChange(nextFilters);

    try {
      const results = await searchContent(nextFilters.query, nextFilters);
      if (!results.length) {
        renderStateBox(resultsEl, 'empty');
        return;
      }

      resultsEl.innerHTML = results
        .map(
          (r) => `
        <article class="search-result" data-id="${escapeHtml(r.id)}" data-type="${escapeHtml(r.hrefType)}" data-node="${escapeHtml(r.node_id || '')}">
          <h3>${escapeHtml(r.title_ar)}</h3>
          <p class="muted">${escapeHtml(r.summary_ar || '')}</p>
          <div class="meta">
            <span class="chip">${escapeHtml(r.resultType)}</span>
            ${reviewBadgeHtml(r.review_status)}
          </div>
        </article>`
        )
        .join('');

      resultsEl.querySelectorAll('.search-result').forEach((el) => {
        el.addEventListener('click', () => {
          openStudyModal({
            type: el.dataset.type,
            id: el.dataset.id,
            nodeId: el.dataset.node,
          });
        });
      });
    } catch (err) {
      renderStateBox(resultsEl, 'error', err.message);
    }
  };

  container.querySelector('#search-query').addEventListener('input', debounce(runSearch, 250));
  ['#search-mode', '#search-type', '#search-review', '#search-surah'].forEach((sel) => {
    container.querySelector(sel).addEventListener('change', runSearch);
  });

  if (filters.mode) container.querySelector('#search-mode').value = filters.mode;
  if (filters.type) container.querySelector('#search-type').value = filters.type;
  if (filters.reviewStatus) container.querySelector('#search-review').value = filters.reviewStatus;

  await runSearch();
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
