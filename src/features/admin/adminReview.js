import { getRepository, getDataMode, isFinalContent } from '../../lib/dataService.js';
import { getEnvConfig } from '../../config/env.js';
import { escapeHtml, formatAyahRef } from '../../lib/utils.js';
import { reviewBadgeHtml } from '../../components/reviewBadge.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';
import {
  buildReviewQueue,
  filterReviewQueue,
  getNonFinalRecords,
  resolveSourceLabels,
  summarizeReviewStats,
} from './reviewQueue.js';
import { applyMockOverrides, saveMockOverride, submitReviewAction } from './reviewActions.js';

/** @type {Object|null} */
let state = null;

/**
 * @param {HTMLElement} container
 */
export async function renderAdminReview(container) {
  container.innerHTML = `
    <section id="admin-review" class="admin-review">
      <div class="wrap">
        <div class="head">
          <span class="eyebrow">حوكمة المحتوى</span>
          <h2>لوحة مراجعة المحتوى (Admin Review)</h2>
          <p>مراجعة السجلات قبل النشر النهائي — الإجراءات تجريبية حتى ربط Supabase.</p>
        </div>
        <div id="admin-review-root"><div class="state-box">جاري تحميل قائمة المراجعة…</div></div>
      </div>
    </section>
  `;

  const root = container.querySelector('#admin-review-root');
  const repo = await getRepository();
  const [nodes, events, themes, eventAyahs, tafsirSources] = await Promise.all([
    repo.getNodes(),
    repo.getEvents(),
    repo.getThemes(),
    repo.getEventAyahs(),
    repo.getTafsirSources(),
  ]);

  const env = getEnvConfig();
  const provider = (await repo.getProvider?.()) || getDataMode();

  state = {
    repo,
    tafsirSources,
    allRecords: buildReviewQueue({ nodes, events, themes, eventAyahs, tafsirSources }),
    filters: {
      recordType: '',
      reviewStatus: 'pending',
      sourceStatus: '',
      sourceId: '',
      nodeType: '',
      onlyNotFinal: false,
      q: '',
    },
    selectedId: null,
    toast: '',
  };

  renderAdminPanel(root);
}

function renderAdminPanel(root) {
  if (!state) return;

  let records = applyMockOverrides(state.allRecords);
  records = filterReviewQueue(records, state.filters);
  const stats = summarizeReviewStats(applyMockOverrides(state.allRecords));
  const nonFinal = getNonFinalRecords(applyMockOverrides(state.allRecords));
  const selected =
    records.find((r) => r.id === state.selectedId && r.recordType === state.selectedType) ||
    records[0] ||
    null;

  if (selected) {
    state.selectedId = selected.id;
    state.selectedType = selected.recordType;
  }

  const pendingRatio = stats.total ? stats.pending / stats.total : 0;
  const warning =
    pendingRatio > 0.5
      ? `<div class="admin-warning">⚠️ ${stats.pending + stats.needs_source} سجلًا (${Math.round(pendingRatio * 100)}%) ما زال قيد المراجعة — لا يُعرض كمحتوى نهائي في الوضع العام.</div>`
      : '';

  root.innerHTML = `
    <div class="admin-grid">
      <aside class="glass pad admin-sidebar">
        <div class="admin-stats">
          <div class="stat"><strong>${stats.total}</strong><span>إجمالي</span></div>
          <div class="stat ok"><strong>${stats.approved}</strong><span>مراجَع</span></div>
          <div class="stat warn"><strong>${stats.pending}</strong><span>قيد المراجعة</span></div>
          <div class="stat rose"><strong>${stats.needs_source}</strong><span>يحتاج مصدر</span></div>
        </div>
        ${warning}
        <p class="muted admin-meta">وضع البيانات: <strong>${escapeHtml(getDataMode())}</strong> · المزود: <strong>${escapeHtml(String(providerLabel()))}</strong></p>
        <p class="disclaimer-banner admin-disclaimer">${DISCLAIMER_AR}</p>

        <h3 class="gold">تصفية</h3>
        <div class="admin-filters">
          <input type="search" id="admin-q" placeholder="بحث…" value="${escapeHtml(state.filters.q)}" />
          <select id="admin-type">
            <option value="" ${state.filters.recordType === '' ? 'selected' : ''}>كل الأنواع</option>
            <option value="node" ${state.filters.recordType === 'node' ? 'selected' : ''}>عقدة</option>
            <option value="event" ${state.filters.recordType === 'event' ? 'selected' : ''}>حدث</option>
            <option value="theme" ${state.filters.recordType === 'theme' ? 'selected' : ''}>محور</option>
          </select>
          <select id="admin-review-status">
            <option value="" ${state.filters.reviewStatus === '' ? 'selected' : ''}>كل حالات المراجعة</option>
            <option value="pending" ${state.filters.reviewStatus === 'pending' ? 'selected' : ''}>قيد المراجعة</option>
            <option value="needs_source" ${state.filters.reviewStatus === 'needs_source' ? 'selected' : ''}>يحتاج مصدر</option>
            <option value="approved" ${state.filters.reviewStatus === 'approved' ? 'selected' : ''}>مراجَع</option>
          </select>
          <select id="admin-source-status">
            <option value="">كل حالات المصدر</option>
            <option value="cited">cited</option>
            <option value="pending">pending</option>
            <option value="needs_source">needs_source</option>
            <option value="none">none</option>
          </select>
          <select id="admin-source-id">
            <option value="">كل المصادر</option>
            ${state.tafsirSources.map((s) => `<option value="${s.id}">${escapeHtml(s.name_ar)}</option>`).join('')}
          </select>
          <select id="admin-node-type">
            <option value="">نوع العقدة</option>
            <option value="prophet">نبي</option>
            <option value="person">شخصية</option>
            <option value="place">مكان</option>
            <option value="theme">محور</option>
            <option value="surah">سورة</option>
          </select>
          <label class="admin-check"><input type="checkbox" id="admin-not-final" ${state.filters.onlyNotFinal ? 'checked' : ''} /> غير نهائي فقط</label>
        </div>

        <h3 class="gold" style="margin-top:16px">غير قابل للعرض النهائي (${nonFinal.length})</h3>
        <p class="muted" style="font-size:13px">محتوى يظهر للتجربة مع شارة مراجعة — لا يُعتبر تفسيرًا نهائيًا في الوضع العام.</p>
      </aside>

      <div class="admin-main glass pad">
        <div class="admin-queue-head">
          <h3 class="gold">قائمة المراجعة (${records.length})</h3>
          ${state.toast ? `<div class="admin-toast">${escapeHtml(state.toast)}</div>` : ''}
        </div>
        <div class="admin-queue" id="admin-queue">
          ${records.length ? records.map((r) => queueItemHtml(r, selected)).join('') : '<p class="muted">لا توجد سجلات مطابقة.</p>'}
        </div>
      </div>

      <div class="admin-detail glass pad" id="admin-detail">
        ${selected ? detailHtml(selected) : '<p class="muted">اختر سجلًا للمراجعة.</p>'}
      </div>
    </div>
  `;

  bindAdminEvents(root, records);
}

function providerLabel() {
  const env = getEnvConfig();
  if (getDataMode() === 'local') return 'local JSON';
  if (!env.isSupabaseConfigured) return 'supabase (fallback → local)';
  return 'supabase placeholder';
}

function queueItemHtml(record, selected) {
  const active =
    selected && selected.id === record.id && selected.recordType === record.recordType
      ? ' active'
      : '';
  return `
    <button type="button" class="admin-queue-item${active}" data-id="${record.id}" data-type="${record.recordType}">
      <span class="tag">${escapeHtml(record.recordType)}</span>
      ${reviewBadgeHtml(record.review_status)}
      <strong>${escapeHtml(record.title_ar)}</strong>
      <span class="muted">${escapeHtml(record.id)}</span>
    </button>`;
}

function detailHtml(record) {
  const sources = resolveSourceLabels(state.tafsirSources, record.source_ids);
  const ayahList =
    record.ayahs?.length > 0
      ? record.ayahs
          .map(
            (a) =>
              `<li>${formatAyahRef(a.surah_id, a.ayah_from, a.ayah_to)} (${escapeHtml(a.relation_type)}) — ${escapeHtml(a.note_ar || '')}</li>`
          )
          .join('')
      : '<li class="muted">لا توجد آيات مرتبطة</li>';

  const sourceList =
    sources.length > 0
      ? sources
          .map(
            (s) =>
              `<li>${escapeHtml(s.name_ar)} ${s.is_approved ? '<span class="tag green">مسجّل</span>' : '<span class="tag rose">غير معتمد</span>'}</li>`
          )
          .join('')
      : '<li class="muted">لا مصادر مسجّلة — يحتاج needs_source أو pending</li>';

  const finalLabel = isFinalContent({ review_status: record.review_status, source_status: record.source_status })
    ? '<span class="tag green">نهائي في الوضع العام</span>'
    : '<span class="tag rose">غير نهائي في الوضع العام</span>';

  return `
    <h3 class="gold">${escapeHtml(record.title_ar)}</h3>
    <p>${reviewBadgeHtml(record.review_status)} ${finalLabel}</p>
    <p class="muted">المعرف: ${escapeHtml(record.id)} · النوع: ${escapeHtml(record.recordType)}${record.node_type ? ` · ${escapeHtml(record.node_type)}` : ''}</p>
    <p style="margin-top:12px">${escapeHtml(record.summary_ar || '—')}</p>

    <h4 class="gold" style="margin-top:18px">مراجع الآيات</h4>
    <ul class="source-list">${ayahList}</ul>

    <h4 class="gold">مراجع المصادر</h4>
    <ul class="source-list">${sourceList}</ul>

    <h4 class="gold" style="margin-top:18px">ملاحظة المراجع</h4>
    <textarea id="admin-note" rows="3" placeholder="ملاحظة للمراجع (اختياري)">${escapeHtml(record.mockOverride?.note || '')}</textarea>

    <div class="admin-actions">
      <button type="button" class="btn primary sm" data-action="approve">اعتماد</button>
      <button type="button" class="btn sm" data-action="needs_source">يحتاج مصدر</button>
      <button type="button" class="btn sm" data-action="reject">رفض</button>
      <button type="button" class="btn sm" data-action="request_revision">طلب تعديل</button>
    </div>
    <p class="muted" style="margin-top:10px;font-size:13px">الإجراءات تجريبية — تُحفظ في الجلسة فقط حتى ربط Supabase.</p>
  `;
}

function bindAdminEvents(root, records) {
  const applyFilters = () => {
    state.filters.q = root.querySelector('#admin-q')?.value || '';
    state.filters.recordType = root.querySelector('#admin-type')?.value || '';
    state.filters.reviewStatus = root.querySelector('#admin-review-status')?.value || '';
    state.filters.sourceStatus = root.querySelector('#admin-source-status')?.value || '';
    state.filters.sourceId = root.querySelector('#admin-source-id')?.value || '';
    state.filters.nodeType = root.querySelector('#admin-node-type')?.value || '';
    state.filters.onlyNotFinal = root.querySelector('#admin-not-final')?.checked || false;
    renderAdminPanel(root);
  };

  ['#admin-q', '#admin-type', '#admin-review-status', '#admin-source-status', '#admin-source-id', '#admin-node-type', '#admin-not-final'].forEach(
    (sel) => {
      const el = root.querySelector(sel);
      el?.addEventListener('input', applyFilters);
      el?.addEventListener('change', applyFilters);
    }
  );

  root.querySelectorAll('.admin-queue-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedId = btn.dataset.id;
      state.selectedType = btn.dataset.type;
      state.toast = '';
      renderAdminPanel(root);
    });
  });

  root.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const selected = records.find(
        (r) => r.id === state.selectedId && r.recordType === state.selectedType
      );
      if (!selected) return;
      const action = btn.dataset.action;
      const note = root.querySelector('#admin-note')?.value || '';
      saveMockOverride(selected, action, note);
      await submitReviewAction(state.repo, { record: selected, action, note });
      state.toast = `تم تسجيل «${action}» (تجريبي) لـ ${selected.title_ar}`;
      renderAdminPanel(root);
    });
  });
}
