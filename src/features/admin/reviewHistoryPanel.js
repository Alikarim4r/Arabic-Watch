import { escapeHtml } from '../../lib/utils.js';
import { isLocalRuntime } from '../../config/env.js';

/**
 * @param {HTMLElement} root
 * @param {Object} ctx
 */
export async function renderReviewHistoryPanel(root, ctx) {
  const { history = [], loading, error, filters = {}, onFilterChange, onRetry } = ctx;
  const local = isLocalRuntime();

  if (loading) {
    root.innerHTML = `<div class="state-box">جاري تحميل سجل المراجعات…</div>`;
    return;
  }

  if (error) {
    root.innerHTML = `
      <div class="state-box error">
        <p>${escapeHtml(error)}</p>
        <button type="button" class="btn sm" id="history-retry">إعادة المحاولة</button>
      </div>`;
    root.querySelector('#history-retry')?.addEventListener('click', () => onRetry?.());
    return;
  }

  const filtered = filterHistory(history, filters);

  root.innerHTML = `
    <div class="review-history-panel">
      <h3 class="gold">سجل المراجعات</h3>
      <p class="muted">${local ? 'سجل الجلسة المحلية — لا يُحفظ بعد إغلاق المتصفح.' : 'سجل audit من review_actions في Supabase.'}</p>

      <div class="admin-filters" style="margin-top:12px">
        <select id="history-action-filter">
          <option value="">كل الإجراءات</option>
          ${['approve', 'reject', 'needs_source', 'request_revision'].map((a) => `<option value="${a}" ${filters.action === a ? 'selected' : ''}>${a}</option>`).join('')}
        </select>
        <select id="history-type-filter">
          <option value="">كل الأنواع</option>
          ${['node', 'event', 'theme'].map((t) => `<option value="${t}" ${filters.recordType === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <input type="search" id="history-reviewer-filter" placeholder="مراجع…" value="${escapeHtml(filters.reviewer || '')}" />
        <input type="date" id="history-from-filter" value="${escapeHtml(filters.dateFrom || '')}" />
        <input type="date" id="history-to-filter" value="${escapeHtml(filters.dateTo || '')}" />
      </div>

      ${
        filtered.length
          ? `<ul class="source-list admin-history">${filtered.map(historyItemHtml).join('')}</ul>`
          : '<div class="state-box">لا توجد إجراءات مطابقة.</div>'
      }
    </div>
  `;

  const apply = () => {
    onFilterChange?.({
      action: root.querySelector('#history-action-filter')?.value || '',
      recordType: root.querySelector('#history-type-filter')?.value || '',
      reviewer: root.querySelector('#history-reviewer-filter')?.value || '',
      dateFrom: root.querySelector('#history-from-filter')?.value || '',
      dateTo: root.querySelector('#history-to-filter')?.value || '',
    });
  };

  root.querySelectorAll('#history-action-filter, #history-type-filter, #history-reviewer-filter, #history-from-filter, #history-to-filter').forEach((el) => {
    el.addEventListener('change', apply);
    el.addEventListener('input', apply);
  });
}

function filterHistory(history, filters) {
  return history.filter((row) => {
    if (filters.action && row.action !== filters.action) return false;
    if (filters.recordType && row.record_type !== filters.recordType) return false;
    if (filters.reviewer) {
      const hay = [row.reviewer_name, row.reviewer_user_id, row.payload?.reviewerName].join(' ');
      if (!hay.includes(filters.reviewer)) return false;
    }
    if (filters.dateFrom && row.created_at && row.created_at.slice(0, 10) < filters.dateFrom) return false;
    if (filters.dateTo && row.created_at && row.created_at.slice(0, 10) > filters.dateTo) return false;
    return true;
  });
}

function historyItemHtml(row) {
  const payloadPreview = row.payload ? JSON.stringify(row.payload, null, 2).slice(0, 400) : '';
  return `
    <li>
      <strong>${escapeHtml(row.action || '—')}</strong>
      <span class="tag">${escapeHtml(row.record_type || '—')}</span>
      <span class="muted">${escapeHtml(row.record_id || '')}</span><br/>
      <span class="tag">${escapeHtml(row.previous_status || '—')} → ${escapeHtml(row.new_status || '—')}</span>
      ${row.reviewer_note ? `<p>${escapeHtml(row.reviewer_note)}</p>` : ''}
      <span class="muted">${escapeHtml(row.reviewer_name || row.reviewer_user_id || '—')} · ${escapeHtml(row.created_at || '')}</span>
      ${row.source === 'local_session' ? '<span class="tag rose">جلسة محلية</span>' : ''}
      ${payloadPreview ? `<pre class="admin-patch-preview">${escapeHtml(payloadPreview)}</pre>` : ''}
    </li>`;
}
