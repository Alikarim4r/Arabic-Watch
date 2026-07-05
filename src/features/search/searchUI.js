import { searchContent } from '../../lib/dataService.js';
import { reviewBadgeHtml } from '../../components/reviewBadge.js';
import { escapeHtml } from '../../lib/utils.js';
import { renderStateBox } from '../../components/loadingState.js';
import { openStudyModal } from '../study/studyModal.js';

const TYPE_TAG = {
  prophet: '',
  person: 'rose',
  event: 'blue',
  theme: 'green',
  place: 'violet',
  surah: 'violet',
};

const TYPE_LABEL = {
  prophet: 'نبي/شخصية',
  person: 'شخصية',
  event: 'حدث',
  theme: 'موضوع',
  place: 'مكان',
  surah: 'سورة',
};

/** @type {null | (() => Promise<void>)} */
let runSearchRef = null;

/**
 * Trigger search from another feature (e.g. graph theme click).
 * @param {string} query
 */
export function triggerSearch(query) {
  const input = document.getElementById('q');
  if (input) {
    input.value = query;
    runSearchRef?.();
  }
}

/**
 * @param {HTMLElement} container
 */
export async function renderSearchView(container) {
  container.innerHTML = `
    <section id="search">
      <div class="wrap">
        <div class="head">
          <span class="eyebrow">البحث والتحليل</span>
          <h2>اسأل الأطلس</h2>
          <p>بحث داخلي مع تطبيع عربي — المحتوى غير المراجع يُعرض بشارات واضحة.</p>
        </div>
        <div class="glass pad">
          <div class="search-box">
            <input id="q" type="search" placeholder="مثال: موسى، الصبر، التمكين، يوسف..." />
            <select id="type">
              <option value="">كل الأنواع</option>
              <option value="prophet">الأنبياء</option>
              <option value="person">الشخصيات</option>
              <option value="event">الأحداث</option>
              <option value="theme">الموضوعات</option>
              <option value="place">الأماكن</option>
              <option value="surah">السور</option>
            </select>
            <select id="search-review">
              <option value="">كل حالات المراجعة</option>
              <option value="approved">مراجَع</option>
              <option value="pending">قيد المراجعة</option>
              <option value="needs_source">يحتاج مصدر</option>
            </select>
          </div>
          <div class="results" id="results"></div>
          <div class="card" style="margin-top:20px">
            <h3>📚 إرشاد البحث</h3>
            <p class="muted">لا يُعرض تفسير مختلق. للأسئلة التفسيرية راجع المصحف وكتب التفسير المعتمدة. المحتوى هنا ملخص تعليمي مرتبط بالآيات.</p>
          </div>
        </div>
      </div>
    </section>
  `;

  const resultsEl = container.querySelector('#results');
  const runSearch = async () => {
    const filters = {
      query: container.querySelector('#q').value,
      mode: 'normalized',
      type: container.querySelector('#type').value,
      reviewStatus: container.querySelector('#search-review').value,
    };

    try {
      const results = await searchContent(filters.query, filters);
      if (!results.length) {
        resultsEl.innerHTML = '<p class="muted">لا توجد نتائج.</p>';
        return;
      }

      resultsEl.innerHTML = results
        .slice(0, 36)
        .map((r) => {
          const tagClass = TYPE_TAG[r.resultType] || '';
          return `
        <div class="card result" data-id="${escapeHtml(r.id)}" data-type="${escapeHtml(r.hrefType)}" data-node="${escapeHtml(r.node_id || '')}">
          <span class="tag ${tagClass}">${TYPE_LABEL[r.resultType] || escapeHtml(r.resultType)}</span>
          ${reviewBadgeHtml(r.review_status)}
          <h3>${escapeHtml(r.title_ar)}</h3>
          <div class="sub">${escapeHtml(r.summary_ar?.slice(0, 80) || '')}</div>
          <p>${escapeHtml((r.summary_ar || '').slice(0, 165))}</p>
        </div>`;
        })
        .join('');

      resultsEl.querySelectorAll('.result').forEach((el) => {
        el.addEventListener('click', () => {
          const type = el.dataset.type;
          const id = el.dataset.id;
          if (type === 'event') {
            openStudyModal({ type: 'event', id, nodeId: el.dataset.node });
          } else if (type === 'surah') {
            openStudyModal({ type: 'surah', id });
          } else if (type === 'theme') {
            openStudyModal({ type: 'theme', id });
          } else {
            openStudyModal({ type: 'node', id });
          }
        });
      });
    } catch (err) {
      renderStateBox(resultsEl, 'error', err.message);
    }
  };

  runSearchRef = runSearch;

  container.querySelector('#q').addEventListener('input', debounce(runSearch, 200));
  container.querySelector('#type').addEventListener('change', runSearch);
  container.querySelector('#search-review').addEventListener('change', runSearch);
  await runSearch();
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
